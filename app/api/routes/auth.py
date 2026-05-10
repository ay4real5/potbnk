from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from types import SimpleNamespace
from app.core.database import SessionLocal, get_engine, get_db
from app.core.config import get_settings
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.core.state import locked_users as _locked_users, reset_tokens as _reset_tokens
from app.models.models import User, Account, LoginAttempt, Notification
from app.schemas.auth import (
    UserRegister, TokenResponse, UserProfile, UserUpdate,
    ForgotPasswordRequest, ResetPasswordRequest,
    TOTPSetupResponse, TOTPVerifyRequest, TOTPLoginRequest,
    StepUpRequest, LoginActivityResponse, NotificationResponse,
)
import uuid
import secrets
import time
import base64
import io
from datetime import datetime, timedelta, timezone
from collections import defaultdict

try:
    import pyotp
    import qrcode
    _TOTP_AVAILABLE = True
except Exception:
    _TOTP_AVAILABLE = False

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ── In-memory rate limiter (login brute-force protection) ─────────────────────
_login_attempts: dict = defaultdict(list)
_RATE_WINDOW = 60   # seconds
_RATE_MAX    = 10   # attempts per window


def _normalize_email(email: str) -> str:
    return email.strip().lower()

def _check_rate_limit(ip: str):
    now = time.monotonic()
    attempts = _login_attempts[ip]
    _login_attempts[ip] = [t for t in attempts if now - t < _RATE_WINDOW]
    if len(_login_attempts[ip]) >= _RATE_MAX:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please wait a minute and try again."
        )
    _login_attempts[ip].append(now)


def _client_ip(request: Request) -> str:
    # Prefer proxy-provided client IP when available (e.g. Vercel/edge proxies).
    xff = request.headers.get("x-forwarded-for")
    if xff:
        first_hop = xff.split(",", 1)[0].strip()
        if first_hop:
            return first_hop
    if request.client and request.client.host:
        return request.client.host
    return "unknown"

def generate_account_number():
    return f"PRO-{secrets.randbelow(9000000000) + 1000000000}"


# ── Temporary tokens for TOTP two-step login ──────────────────────────────────
_temp_tokens: dict = {}
_TEMP_TOKEN_TTL = timedelta(minutes=5)


def _create_temp_token(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    _temp_tokens[token] = {"user_id": user_id, "expires_at": datetime.now(timezone.utc) + _TEMP_TOKEN_TTL}
    return token


def _consume_temp_token(token: str) -> str | None:
    data = _temp_tokens.get(token)
    if not data:
        return None
    if datetime.now(timezone.utc) > data["expires_at"]:
        del _temp_tokens[token]
        return None
    del _temp_tokens[token]
    return data["user_id"]


def _record_login_attempt(db: Session, email: str, ip: str, user_agent: str | None, success: bool, user_id=None, failure_reason=None):
    device = (user_agent or "").split(" ")[0][:120] if user_agent else None
    attempt = LoginAttempt(
        id=uuid.uuid4(),
        user_id=user_id,
        email=email,
        ip_address=ip,
        user_agent=user_agent[:500] if user_agent else None,
        device=device,
        success=success,
        failure_reason=failure_reason,
    )
    db.add(attempt)
    db.commit()


def _create_notification(db: Session, user_id: uuid.UUID, category: str, title: str, body: str):
    note = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        category=category,
        title=title,
        body=body,
    )
    db.add(note)
    db.commit()


def get_current_user(token: str = Depends(oauth2_scheme)):
    from app.core.database import ensure_schema
    ensure_schema()
    settings = get_settings()
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    subject = payload.get("sub")
    role = payload.get("role", "user")

    # Check demo user before touching the database
    if settings.demo_login_enabled and subject == settings.demo_login_user_id:
        return SimpleNamespace(
            id=uuid.UUID(settings.demo_login_user_id),
            full_name=settings.demo_login_full_name,
            email=settings.demo_login_email,
            created_at=datetime.now(timezone.utc),
            hashed_password="",
            role="admin",
            is_admin=True,
        )

    if settings.admin_login_enabled and role == "admin" and subject == _normalize_email(settings.admin_login_email):
        return SimpleNamespace(
            id=uuid.uuid5(uuid.NAMESPACE_DNS, subject),
            full_name=settings.admin_login_full_name,
            email=subject,
            created_at=datetime.now(timezone.utc),
            hashed_password="",
            role="admin",
            is_admin=True,
        )

    db = SessionLocal(bind=get_engine())
    try:
        user = db.query(User).filter(User.id == subject).first()
    finally:
        db.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Reject locked accounts
    if str(user.id) in _locked_users:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been locked. Please contact support.",
        )

    return user


@router.post("/register", status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    try:
        normalized_email = _normalize_email(payload.email)

        # Check if email already exists
        existing = db.query(User).filter(User.email == normalized_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        # Create user
        new_user = User(
            id=uuid.uuid4(),
            full_name=payload.full_name,
            email=normalized_email,
            hashed_password=get_password_hash(payload.password)
        )
        db.add(new_user)
        db.flush()  # Get the user ID before committing

        # Auto-create a Checking and Savings account for every new user
        for account_type in ["CHECKING", "SAVINGS"]:
            account_created = False
            for attempt in range(10):  # Retry on collision
                account_number = generate_account_number()
                account = Account(
                    id=uuid.uuid4(),
                    user_id=new_user.id,
                    account_number=account_number,
                    account_type=account_type,
                    balance=0.00
                )
                db.add(account)
                try:
                    db.flush()
                    account_created = True
                    break
                except IntegrityError:
                    # Account number collision - remove the failed account and retry with a new number
                    db.expunge(account)
            
            if not account_created:
                # Could not create account after 10 attempts
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to generate unique account number.")

        db.commit()

        return {
            "status": "success",
            "message": f"Welcome to ProBank, {new_user.full_name}! Your accounts are ready.",
            "user_id": str(new_user.id)
        }
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Database error during registration: {exc.__class__.__name__}") from exc


@router.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    from app.core.database import ensure_schema
    ensure_schema()  # Make sure tables exist before login (especially on fresh starts)

    settings = get_settings()
    client_ip = _client_ip(request)
    _check_rate_limit(client_ip)
    normalized_email = _normalize_email(form_data.username)
    user_agent = request.headers.get("user-agent")

    db = SessionLocal(bind=get_engine())
    try:
        user = db.query(User).filter(User.email == normalized_email).first()
    finally:
        db.close()

    # Demo / admin short-circuit
    if settings.demo_login_enabled and normalized_email == _normalize_email(settings.demo_login_email):
        if form_data.password != settings.demo_login_password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.", headers={"WWW-Authenticate": "Bearer"})
        token = create_access_token(data={"sub": settings.demo_login_user_id, "role": "admin"})
        return {"access_token": token, "token_type": "bearer", "expires_in": 1800}

    if settings.admin_login_enabled and normalized_email == _normalize_email(settings.admin_login_email):
        if form_data.password != settings.admin_login_password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.", headers={"WWW-Authenticate": "Bearer"})
        token = create_access_token(data={"sub": normalized_email, "role": "admin"})
        return {"access_token": token, "token_type": "bearer", "expires_in": 1800}

    if not user or not verify_password(form_data.password, user.hashed_password):
        db = SessionLocal(bind=get_engine())
        try:
            _record_login_attempt(db, normalized_email, client_ip, user_agent, success=False, failure_reason="Invalid password")
        except Exception:
            pass  # Don't let audit logging block login
        finally:
            db.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.", headers={"WWW-Authenticate": "Bearer"})

    if str(user.id) in _locked_users:
        db = SessionLocal(bind=get_engine())
        try:
            _record_login_attempt(db, normalized_email, client_ip, user_agent, success=False, user_id=user.id, failure_reason="Account locked")
        except Exception:
            pass
        finally:
            db.close()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account has been locked. Please contact support.")

    # Two-step TOTP
    if user.totp_enabled and user.totp_secret:
        temp_token = _create_temp_token(str(user.id))
        return {"temp_token": temp_token, "requires_totp": True}

    # Standard login
    db = SessionLocal(bind=get_engine())
    try:
        _record_login_attempt(db, normalized_email, client_ip, user_agent, success=True, user_id=user.id)
    except Exception:
        pass
    finally:
        db.close()

    db = SessionLocal(bind=get_engine())
    try:
        _create_notification(db, user.id, "SECURITY", "New login detected", f"Login from {client_ip} at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}.")
    except Exception:
        pass
    finally:
        db.close()

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "expires_in": 1800}


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "created_at": str(current_user.created_at),
        "role": getattr(current_user, "role", "user"),
        "is_admin": bool(getattr(current_user, "is_admin", False)),
    }


@router.patch("/me", response_model=UserProfile)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.new_password is not None:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password.")
        if not verify_password(payload.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect.")
        if len(payload.new_password) < 8:
            raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
        current_user.hashed_password = get_password_hash(payload.new_password)

    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "created_at": str(current_user.created_at)
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generate a password-reset token.
    In production this would be emailed; in this demo the token is returned
    directly in the response so the frontend can display a clickable reset link.
    Always returns 200 to prevent email enumeration.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Generic success response — don't reveal whether the email exists
        return {"status": "success", "message": "If that email is registered, a reset link has been generated.", "reset_token": None}

    # Purge any stale tokens for this user
    stale = [k for k, v in _reset_tokens.items() if v["user_id"] == str(user.id)]
    for k in stale:
        del _reset_tokens[k]

    token = secrets.token_urlsafe(32)
    _reset_tokens[token] = {
        "user_id": str(user.id),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
    }

    return {
        "status": "success",
        "message": "Reset link generated.",
        # Demo-only: returned in response so the UI can build a clickable link.
        # In production, remove this field and email the link instead.
        "reset_token": token,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_data = _reset_tokens.get(payload.token)
    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    if datetime.now(timezone.utc) > token_data["expires_at"]:
        del _reset_tokens[payload.token]
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")

    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    del _reset_tokens[payload.token]

    return {"status": "success", "message": "Password updated. You can now sign in with your new password."}


@router.post("/totp/setup", response_model=TOTPSetupResponse)
def totp_setup(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _TOTP_AVAILABLE:
        raise HTTPException(status_code=503, detail="TOTP service unavailable.")
    if current_user.totp_enabled:
        raise HTTPException(status_code=400, detail="TOTP is already enabled. Disable it first to reconfigure.")
    secret = pyotp.random_base32()
    user = db.query(User).filter(User.id == current_user.id).first()
    user.totp_secret = secret
    db.commit()
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="Hunch Banking")
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode()
    return {"secret": secret, "provisioning_uri": uri, "qr_base64": f"data:image/png;base64,{qr_base64}"}


@router.post("/totp/verify")
def totp_verify(payload: TOTPVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _TOTP_AVAILABLE:
        raise HTTPException(status_code=503, detail="TOTP service unavailable.")
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP is not configured.")
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid verification code.")
    user.totp_enabled = True
    db.commit()
    return {"status": "success", "message": "Two-factor authentication enabled."}


@router.post("/totp/disable")
def totp_disable(payload: TOTPVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _TOTP_AVAILABLE:
        raise HTTPException(status_code=503, detail="TOTP service unavailable.")
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user.totp_secret or not user.totp_enabled:
        raise HTTPException(status_code=400, detail="TOTP is not enabled.")
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid verification code.")
    user.totp_secret = None
    user.totp_enabled = False
    db.commit()
    return {"status": "success", "message": "Two-factor authentication disabled."}


@router.post("/totp/verify-login", response_model=TokenResponse)
def totp_verify_login(payload: TOTPLoginRequest, request: Request):
    if not _TOTP_AVAILABLE:
        raise HTTPException(status_code=503, detail="TOTP service unavailable.")
    user_id = _consume_temp_token(payload.temp_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    db = SessionLocal(bind=get_engine())
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.totp_secret:
            raise HTTPException(status_code=401, detail="Invalid session.")
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(payload.code, valid_window=1):
            raise HTTPException(status_code=401, detail="Invalid verification code.")
        token = create_access_token(data={"sub": str(user.id)})
        _record_login_attempt(db, user.email, _client_ip(request), request.headers.get("user-agent"), success=True, user_id=user.id)
        _create_notification(db, user.id, "SECURITY", "New login detected", f"Login from {_client_ip(request)} at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}.")
        return {"access_token": token, "token_type": "bearer", "expires_in": 1800}
    finally:
        db.close()


@router.post("/step-up")
def step_up_verify(payload: StepUpRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not _TOTP_AVAILABLE:
        raise HTTPException(status_code=503, detail="TOTP service unavailable.")
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user or not user.totp_enabled or not user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP is not enabled on this account.")
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid verification code.")
    return {"status": "success", "verified": True}


@router.get("/login-activity", response_model=list[LoginActivityResponse])
def login_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.user_id == current_user.id)
        .order_by(LoginAttempt.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": a.id,
            "ip_address": a.ip_address,
            "user_agent": a.user_agent,
            "device": a.device,
            "success": a.success,
            "failure_reason": a.failure_reason,
            "created_at": str(a.created_at),
        }
        for a in attempts
    ]


@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notes = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": n.id,
            "category": n.category,
            "title": n.title,
            "body": n.body,
            "is_read": n.is_read,
            "created_at": str(n.created_at),
        }
        for n in notes
    ]


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found.")
    note.is_read = True
    db.commit()
    return {"status": "success"}


@router.delete("/notifications/{notification_id}", status_code=204)
def delete_notification(notification_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found.")
    db.delete(note)
    db.commit()
    return None
