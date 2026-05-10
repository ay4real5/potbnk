from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.ledger import perform_withdrawal
from app.api.routes.auth import get_current_user, _create_notification
from app.models.models import Biller, BillPayment, Account, User
from app.schemas.accounts import BillerCreate, BillerResponse, BillPaymentCreate, BillPaymentResponse

router = APIRouter(prefix="/billers", tags=["Bill Pay"])


@router.get("/", response_model=List[BillerResponse])
def list_billers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Biller).filter(Biller.user_id == current_user.id).order_by(Biller.name.asc()).all()


@router.post("/", response_model=BillerResponse, status_code=201)
def create_biller(payload: BillerCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Biller name is required.")
    biller = Biller(
        id=uuid.uuid4(),
        user_id=current_user.id,
        name=payload.name.strip(),
        category=payload.category.strip(),
        account_number=payload.account_number.strip() if payload.account_number else None,
        nickname=payload.nickname.strip() if payload.nickname else None,
    )
    db.add(biller)
    db.commit()
    db.refresh(biller)
    return biller


@router.delete("/{biller_id}", status_code=204)
def delete_biller(biller_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    biller = db.query(Biller).filter(Biller.id == biller_id, Biller.user_id == current_user.id).first()
    if not biller:
        raise HTTPException(status_code=404, detail="Biller not found.")
    db.delete(biller)
    db.commit()
    return None


@router.get("/payments", response_model=List[BillPaymentResponse])
def list_payments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(BillPayment).filter(BillPayment.user_id == current_user.id).order_by(BillPayment.created_at.desc()).all()


@router.post("/payments", response_model=BillPaymentResponse, status_code=201)
def create_payment(payload: BillPaymentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    biller = db.query(Biller).filter(Biller.id == payload.biller_id, Biller.user_id == current_user.id).first()
    if not biller:
        raise HTTPException(status_code=404, detail="Biller not found.")
    account = db.query(Account).filter(Account.id == payload.account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="You do not own this account.")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if account.balance < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")

    # Process immediately
    account.balance -= payload.amount
    payment = BillPayment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        biller_id=payload.biller_id,
        account_id=payload.account_id,
        amount=payload.amount,
        status="PAID",
        paid_at=datetime.now(timezone.utc),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    _create_notification(db, current_user.id, "TRANSFER", f"Bill payment of ${payload.amount:,.2f}", f"Paid to {biller.name} from your {account.account_type.replace('_', ' ')} account.")
    return payment
