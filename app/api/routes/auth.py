from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from types import SimpleNamespace
from app.core.database import SessionLocal, get_engine, get_db
from app.core.config import get_settings
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.models.models import User, Account
from app.schemas.auth import UserRegister, TokenResponse, UserProfile, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
import uuid
import secrets
import time
from datetime import datetime, timedelta, timezone
from collections import defaultdict

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

# ── In-memory password reset tokens {token: {user_id, expires_at}} ───────────
_reset_tokens: dict = {}

def generate_account_number():
    return f"PRO-{secrets.randbelow(9000000000) + 1000000000}"


def get_current_user(token: str = Depends(oauth2_scheme)):
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
    return user


@router.post("/register", status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
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
        for _ in range(10):  # Retry on collision
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
                break
            except IntegrityError:
                db.rollback()
                db.add(new_user)
                db.flush()
        else:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to generate unique account number.")

    db.commit()

    return {
        "status": "success",
        "message": f"Welcome to ProBank, {new_user.full_name}! Your accounts are ready.",
        "user_id": str(new_user.id)
    }


@router.post("/login", response_model=TokenResponse)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    settings = get_settings()
    _check_rate_limit(_client_ip(request))
    normalized_email = _normalize_email(form_data.username)

    if settings.demo_login_enabled and normalized_email == _normalize_email(settings.demo_login_email):
        # Short-circuit: never touch the database for the demo account.
        # Return 401 immediately on wrong password so Vercel doesn't hang
        # waiting on an unreachable DB connection.
        if form_data.password != settings.demo_login_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        token = create_access_token(data={"sub": settings.demo_login_user_id, "role": "admin"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 1800,
        }

    if settings.admin_login_enabled and normalized_email == _normalize_email(settings.admin_login_email):
        if form_data.password != settings.admin_login_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        token = create_access_token(data={"sub": normalized_email, "role": "admin"})
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 1800,
        }

    db = SessionLocal(bind=get_engine())
    try:
        user = db.query(User).filter(User.email == normalized_email).first()
    finally:
        db.close()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 1800
    }


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
