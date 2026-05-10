from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.ledger import perform_deposit
from app.api.routes.auth import get_current_user, _create_notification
from app.models.models import CheckDeposit, Account, User
from app.schemas.accounts import CheckDepositCreate, CheckDepositResponse

router = APIRouter(prefix="/check-deposits", tags=["Mobile Check Deposit"])


@router.get("/", response_model=List[CheckDepositResponse])
def list_deposits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CheckDeposit).filter(CheckDeposit.user_id == current_user.id).order_by(CheckDeposit.created_at.desc()).all()


@router.post("/", response_model=CheckDepositResponse, status_code=201)
def submit_check(payload: CheckDepositCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == payload.account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="You do not own this account.")
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    hold_until = datetime.now(timezone.utc) + timedelta(days=2)
    deposit = CheckDeposit(
        id=uuid.uuid4(),
        user_id=current_user.id,
        account_id=payload.account_id,
        amount=payload.amount,
        memo=payload.memo.strip() if payload.memo else None,
        hold_until=hold_until,
        status="PENDING",
    )
    db.add(deposit)
    db.commit()
    db.refresh(deposit)
    return deposit


@router.post("/{deposit_id}/clear")
def clear_check(deposit_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deposit = db.query(CheckDeposit).filter(CheckDeposit.id == deposit_id, CheckDeposit.user_id == current_user.id).first()
    if not deposit:
        raise HTTPException(status_code=404, detail="Deposit not found.")
    if deposit.status != "PENDING":
        raise HTTPException(status_code=400, detail="Deposit is already cleared.")
    # Credit the account
    tx = perform_deposit(db, deposit.account_id, deposit.amount, deposit.memo or "Mobile check deposit")
    deposit.status = "CLEARED"
    db.commit()
    db.refresh(deposit)
    _create_notification(db, current_user.id, "DEPOSIT", f"Check cleared: ${deposit.amount:,.2f}", f"Your mobile check deposit has cleared and funds are available.")
    return {"status": "success", "message": f"Check of ${deposit.amount:,.2f} cleared."}
