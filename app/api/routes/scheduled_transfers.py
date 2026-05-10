from datetime import datetime, timedelta, timezone
from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.ledger import perform_transfer, perform_external_transfer
from app.api.routes.auth import get_current_user
from app.models.models import Account, ScheduledTransfer, User
from app.schemas.accounts import ScheduledTransferCreate, ScheduledTransferResponse


router = APIRouter(prefix="/scheduled-transfers", tags=["Scheduled Transfers"])


def _advance(next_run_at: datetime, frequency: str) -> datetime | None:
    if frequency == "ONCE":
        return None
    if frequency == "WEEKLY":
        return next_run_at + timedelta(days=7)
    if frequency == "BIWEEKLY":
        return next_run_at + timedelta(days=14)
    if frequency == "MONTHLY":
        # Approximate monthly as +30 days for simplicity and predictability
        return next_run_at + timedelta(days=30)
    return None


@router.get("/", response_model=List[ScheduledTransferResponse])
def list_scheduled_transfers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(ScheduledTransfer)
        .filter(ScheduledTransfer.user_id == current_user.id)
        .order_by(ScheduledTransfer.next_run_at.asc())
        .all()
    )


@router.post("/", response_model=ScheduledTransferResponse, status_code=201)
def create_scheduled_transfer(
    payload: ScheduledTransferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sender = (
        db.query(Account)
        .filter(Account.id == payload.sender_account_id, Account.user_id == current_user.id)
        .first()
    )
    if not sender:
        raise HTTPException(status_code=403, detail="You do not own the sender account.")

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    is_internal = payload.receiver_account_id is not None
    is_external = bool(
        payload.external_account_number and payload.external_recipient_name and payload.external_bank_name
    )
    if is_internal == is_external:
        raise HTTPException(
            status_code=400,
            detail="Provide either an internal receiver_account_id or full external recipient details (not both).",
        )

    if is_internal:
        receiver = db.query(Account).filter(Account.id == payload.receiver_account_id).first()
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver account not found.")
        if receiver.id == sender.id:
            raise HTTPException(status_code=400, detail="Cannot schedule transfer to the same account.")

    scheduled = ScheduledTransfer(
        id=uuid.uuid4(),
        user_id=current_user.id,
        sender_account_id=payload.sender_account_id,
        receiver_account_id=payload.receiver_account_id,
        external_recipient_name=payload.external_recipient_name,
        external_bank_name=payload.external_bank_name,
        external_account_number=payload.external_account_number,
        external_routing_number=payload.external_routing_number,
        amount=payload.amount,
        description=payload.description or "Scheduled transfer",
        frequency=payload.frequency,
        next_run_at=payload.next_run_at,
        status="ACTIVE",
    )
    db.add(scheduled)
    db.commit()
    db.refresh(scheduled)
    return scheduled


@router.post("/{scheduled_id}/pause", response_model=ScheduledTransferResponse)
def pause_scheduled(
    scheduled_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = _get_owned(db, scheduled_id, current_user)
    s.status = "PAUSED"
    db.commit()
    db.refresh(s)
    return s


@router.post("/{scheduled_id}/resume", response_model=ScheduledTransferResponse)
def resume_scheduled(
    scheduled_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = _get_owned(db, scheduled_id, current_user)
    if s.status != "PAUSED":
        raise HTTPException(status_code=400, detail="Only paused schedules can be resumed.")
    s.status = "ACTIVE"
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{scheduled_id}", status_code=204)
def delete_scheduled(
    scheduled_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = _get_owned(db, scheduled_id, current_user)
    db.delete(s)
    db.commit()
    return None


@router.post("/run-due")
def run_due(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Process all of the current user's due ACTIVE scheduled transfers."""
    now = datetime.now(timezone.utc)
    due = (
        db.query(ScheduledTransfer)
        .filter(
            ScheduledTransfer.user_id == current_user.id,
            ScheduledTransfer.status == "ACTIVE",
            ScheduledTransfer.next_run_at <= now,
        )
        .all()
    )
    processed = 0
    failed = 0
    for s in due:
        try:
            if s.receiver_account_id:
                perform_transfer(
                    db,
                    s.sender_account_id,
                    s.receiver_account_id,
                    s.amount,
                    s.description or "Scheduled transfer",
                )
            else:
                perform_external_transfer(
                    db,
                    s.sender_account_id,
                    s.amount,
                    s.external_recipient_name or "External recipient",
                    s.external_bank_name or "External bank",
                    s.external_account_number or "",
                    s.external_routing_number,
                    s.description or "Scheduled external transfer",
                )
            s.last_run_at = now
            s.run_count = (s.run_count or 0) + 1
            advance = _advance(s.next_run_at, s.frequency)
            if advance is None:
                s.status = "COMPLETED"
            else:
                s.next_run_at = advance
            db.commit()
            processed += 1
        except Exception:
            db.rollback()
            s.status = "FAILED"
            db.commit()
            failed += 1
    return {"processed": processed, "failed": failed, "checked": len(due)}


def _get_owned(db: Session, scheduled_id: uuid.UUID, user: User) -> ScheduledTransfer:
    s = (
        db.query(ScheduledTransfer)
        .filter(ScheduledTransfer.id == scheduled_id, ScheduledTransfer.user_id == user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Scheduled transfer not found.")
    return s
