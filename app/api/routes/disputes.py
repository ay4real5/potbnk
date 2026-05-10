from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Dispute, Transaction, Account, User
from app.schemas.auth import DisputeCreate, DisputeResponse


router = APIRouter(prefix="/disputes", tags=["Disputes"])


@router.get("/", response_model=List[DisputeResponse])
def list_disputes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Dispute)
        .filter(Dispute.user_id == current_user.id)
        .order_by(Dispute.created_at.desc())
        .all()
    )


@router.post("/", response_model=DisputeResponse, status_code=201)
def create_dispute(
    payload: DisputeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = db.query(Transaction).filter(Transaction.id == payload.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    # Verify user owns one of the accounts involved
    account_ids = {tx.sender_id, tx.receiver_id}
    user_accounts = {a.id for a in db.query(Account).filter(Account.user_id == current_user.id).all()}
    if not account_ids & user_accounts:
        raise HTTPException(status_code=403, detail="You can only dispute transactions on your accounts.")
    if not payload.reason.strip():
        raise HTTPException(status_code=400, detail="Reason is required.")
    dispute = Dispute(
        id=uuid.uuid4(),
        user_id=current_user.id,
        transaction_id=payload.transaction_id,
        reason=payload.reason.strip(),
        status="OPEN",
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute


@router.get("/{dispute_id}", response_model=DisputeResponse)
def get_dispute(
    dispute_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    d = db.query(Dispute).filter(Dispute.id == dispute_id, Dispute.user_id == current_user.id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dispute not found.")
    return d
