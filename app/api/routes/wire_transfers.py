from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.ledger import perform_external_transfer
from app.api.routes.auth import get_current_user, _create_notification
from app.models.models import WireTransfer, Account, User
from app.schemas.accounts import WireTransferCreate, WireTransferResponse

router = APIRouter(prefix="/wire-transfers", tags=["Wire Transfers"])

WIRE_FEE = Decimal("25.00")
WIRE_MIN = Decimal("100.00")
WIRE_MAX = Decimal("100000.00")


@router.get("/", response_model=List[WireTransferResponse])
def list_wires(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(WireTransfer).filter(WireTransfer.user_id == current_user.id).order_by(WireTransfer.created_at.desc()).all()


@router.post("/", response_model=WireTransferResponse, status_code=201)
def create_wire(payload: WireTransferCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.amount < WIRE_MIN:
        raise HTTPException(status_code=400, detail=f"Wire transfer minimum is ${WIRE_MIN:,.2f}.")
    if payload.amount > WIRE_MAX:
        raise HTTPException(status_code=400, detail=f"Wire transfer maximum is ${WIRE_MAX:,.2f}.")

    account = db.query(Account).filter(Account.id == payload.sender_account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="You do not own this account.")
    total = payload.amount + WIRE_FEE
    if account.balance < total:
        raise HTTPException(status_code=400, detail="Insufficient funds including wire fee.")

    try:
        # Debit fee + amount from account
        account.balance -= total

        wire = WireTransfer(
            id=uuid.uuid4(),
            user_id=current_user.id,
            sender_account_id=payload.sender_account_id,
            amount=payload.amount,
            recipient_name=payload.recipient_name.strip(),
            recipient_bank=payload.recipient_bank.strip(),
            recipient_account_number=payload.recipient_account_number.strip(),
            swift_code=payload.swift_code.strip().upper() if payload.swift_code else None,
            reference=payload.reference.strip() if payload.reference else None,
            fee=WIRE_FEE,
            status="COMPLETED",
        )
        db.add(wire)

        perform_external_transfer(
            db,
            payload.sender_account_id,
            payload.amount,
            payload.recipient_name,
            payload.recipient_bank,
            payload.recipient_account_number,
            payload.swift_code,
            f"Wire transfer: {payload.reference or 'No reference'}",
        )

        db.commit()
        db.refresh(wire)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Wire transfer failed. Please try again.")

    try:
        _create_notification(
            db, current_user.id, "TRANSFER",
            f"Wire sent: ${payload.amount:,.2f}",
            f"To {payload.recipient_name} at {payload.recipient_bank}. Fee: ${WIRE_FEE:,.2f}."
        )
    except Exception:
        pass  # Don't let notification failures block the response

    return wire
