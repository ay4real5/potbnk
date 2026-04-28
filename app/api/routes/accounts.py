from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.ledger import perform_transfer, perform_deposit, perform_withdrawal
from app.api.routes.auth import get_current_user
from app.models.models import User, Account, Transaction
from app.schemas.accounts import (
    AccountResponse,
    TransactionResponse,
    TransferRequest,
    DepositRequest,
    WithdrawRequest
)
from typing import List
from decimal import Decimal

router = APIRouter(prefix="/accounts", tags=["Accounts & Ledger"])

@router.get("/", response_model=List[AccountResponse])
def get_my_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return accounts

@router.get("/{account_id}/balance")
def get_balance(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    return {
        "account_number": account.account_number,
        "account_type": account.account_type,
        "available_balance": float(account.balance),
        "current_balance": float(account.balance),
        "currency": "USD"
    }

@router.get("/{account_id}/transactions", response_model=List[TransactionResponse])
def get_transactions(
    account_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify ownership
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    transactions = (
        db.query(Transaction)
        .filter(
            or_(
                Transaction.sender_id == account.id,
                Transaction.receiver_id == account.id
            )
        )
        .order_by(Transaction.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return transactions

@router.post("/deposit")
def deposit(
    payload: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify ownership
    account = db.query(Account).filter(
        Account.id == payload.account_id,
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    try:
        tx = perform_deposit(db, payload.account_id, payload.amount, payload.description)
        db.refresh(account)
        return {
            "status": "success",
            "message": f"${payload.amount:,.2f} deposited successfully.",
            "transaction_id": str(tx.id),
            "new_balance": float(account.balance)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transfer")
def transfer(
    payload: TransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify sender owns the account
    sender = db.query(Account).filter(
        Account.id == payload.sender_account_id,
        Account.user_id == current_user.id
    ).first()

    if not sender:
        raise HTTPException(status_code=403, detail="You do not own this account.")

    # Daily transfer limit (real bank behavior)
    DAILY_LIMIT = Decimal("10000.00")
    if payload.amount > DAILY_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"Transfer exceeds daily limit of ${DAILY_LIMIT:,.2f}."
        )

    try:
        tx = perform_transfer(
            db,
            payload.sender_account_id,
            payload.receiver_account_id,
            payload.amount,
            payload.description
        )
        db.refresh(sender)
        return {
            "status": "success",
            "message": f"${payload.amount:,.2f} transferred successfully.",
            "transaction_id": str(tx.id),
            "remaining_balance": float(sender.balance)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/withdraw")
def withdraw(
    payload: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(
        Account.id == payload.account_id,
        Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")

    try:
        tx = perform_withdrawal(db, payload.account_id, payload.amount, payload.description)
        db.refresh(account)
        return {
            "status": "success",
            "message": f"${payload.amount:,.2f} withdrawn successfully.",
            "transaction_id": str(tx.id),
            "new_balance": float(account.balance)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
