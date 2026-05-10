from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Referral, User
from app.schemas.accounts import ReferralCreate, ReferralResponse

router = APIRouter(prefix="/referrals", tags=["Referrals"])


@router.get("/", response_model=List[ReferralResponse])
def list_referrals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Referral).filter(Referral.referrer_id == current_user.id).order_by(Referral.created_at.desc()).all()


@router.post("/", response_model=ReferralResponse, status_code=201)
def create_referral(payload: ReferralCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    email = payload.referred_email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address.")
    existing = db.query(Referral).filter(Referral.referred_email == email, Referral.referrer_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already invited this email.")
    ref = Referral(
        id=uuid.uuid4(),
        referrer_id=current_user.id,
        referred_email=email,
    )
    db.add(ref)
    db.commit()
    db.refresh(ref)
    return ref
