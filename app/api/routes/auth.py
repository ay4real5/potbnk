from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.models.models import User, Account
from app.schemas.auth import UserRegister, TokenResponse, UserProfile
import uuid
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def generate_account_number():
    return f"PRO-{secrets.randbelow(9000000000) + 1000000000}"


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register", status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Create user
    new_user = User(
        id=uuid.uuid4(),
        full_name=payload.full_name,
        email=payload.email,
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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()

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
        "created_at": str(current_user.created_at)
    }
