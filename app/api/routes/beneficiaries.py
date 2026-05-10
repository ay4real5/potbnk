from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Beneficiary, User, Account
from app.schemas.accounts import BeneficiaryCreate, BeneficiaryResponse


router = APIRouter(prefix="/beneficiaries", tags=["Beneficiaries"])


@router.get("/", response_model=List[BeneficiaryResponse])
def list_beneficiaries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Beneficiary)
        .filter(Beneficiary.user_id == current_user.id)
        .order_by(Beneficiary.created_at.desc())
        .all()
    )


@router.post("/", response_model=BeneficiaryResponse, status_code=201)
def create_beneficiary(
    payload: BeneficiaryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not payload.recipient_name.strip() or not payload.bank_name.strip() or not payload.account_number.strip():
        raise HTTPException(status_code=400, detail="Recipient name, bank name, and account number are required.")

    # If marked internal, validate that account exists in our system
    if payload.is_internal:
        account = db.query(Account).filter(Account.account_number == payload.account_number.strip()).first()
        if not account:
            raise HTTPException(status_code=404, detail="Internal account not found.")

    beneficiary = Beneficiary(
        id=uuid.uuid4(),
        user_id=current_user.id,
        nickname=payload.nickname.strip() if payload.nickname else None,
        recipient_name=payload.recipient_name.strip(),
        bank_name=payload.bank_name.strip(),
        account_number=payload.account_number.strip(),
        routing_number=payload.routing_number.strip() if payload.routing_number else None,
        is_internal=payload.is_internal,
    )
    db.add(beneficiary)
    db.commit()
    db.refresh(beneficiary)
    return beneficiary


@router.delete("/{beneficiary_id}", status_code=204)
def delete_beneficiary(
    beneficiary_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    beneficiary = (
        db.query(Beneficiary)
        .filter(Beneficiary.id == beneficiary_id, Beneficiary.user_id == current_user.id)
        .first()
    )
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found.")
    db.delete(beneficiary)
    db.commit()
    return None
