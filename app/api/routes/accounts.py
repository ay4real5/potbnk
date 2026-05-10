from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.ledger import perform_transfer, perform_external_transfer, perform_deposit, perform_withdrawal
from app.api.routes.auth import get_current_user
from app.models.models import User, Account, Transaction, Notification
from app.api.routes.auth import _create_notification
from app.schemas.accounts import (
    AccountResponse,
    TransactionResponse,
    TransferRequest,
    ExternalTransferRequest,
    DepositRequest,
    WithdrawRequest,
    OpenAccountRequest,
)
from typing import List, Optional
from decimal import Decimal
import uuid
import secrets

router = APIRouter(prefix="/accounts", tags=["Accounts & Ledger"])


def _generate_account_number() -> str:
    return f"PRO-{secrets.randbelow(9000000000) + 1000000000}"

@router.get("/lookup")
def lookup_account(
    account_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Look up an account by account number (for transfer recipient resolution)."""
    account = db.query(Account).filter(Account.account_number == account_number).first()
    if not account:
        raise HTTPException(status_code=404, detail="No account found with that account number.")
    # Return just enough info for the sender to confirm the right recipient
    return {
        "id": str(account.id),
        "account_number": account.account_number,
        "account_type": account.account_type,
        "holder_name": account.user.full_name,
    }


@router.post("/open", status_code=201)
def open_account(
    payload: OpenAccountRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Open a new bank account for the authenticated user (max 5 total)."""
    existing_count = db.query(Account).filter(Account.user_id == current_user.id).count()
    if existing_count >= 5:
        raise HTTPException(status_code=400, detail="You may not have more than 5 accounts.")

    for _ in range(10):
        account_number = _generate_account_number()
        account = Account(
            id=uuid.uuid4(),
            user_id=current_user.id,
            account_number=account_number,
            account_type=payload.account_type,
            balance=0.00,
        )
        db.add(account)
        try:
            db.commit()
            db.refresh(account)
            return {
                "status": "success",
                "message": f"Your new {payload.account_type.replace('_', ' ').title()} account has been opened.",
                "account_id": str(account.id),
                "account_number": account.account_number,
                "account_type": account.account_type,
            }
        except IntegrityError:
            db.rollback()

    raise HTTPException(status_code=500, detail="Failed to generate a unique account number. Please try again.")


@router.get("/transactions", response_model=List[TransactionResponse])
def get_all_transactions(
    limit: int = 100,
    offset: int = 0,
    tx_type: Optional[str] = Query(None, description="Filter by type: DEPOSIT, WITHDRAWAL, TRANSFER"),
    q: Optional[str] = Query(None, description="Search description (case-insensitive)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all transactions across every account owned by the current user."""
    account_ids = [
        row.id for row in db.query(Account.id).filter(Account.user_id == current_user.id).all()
    ]
    if not account_ids:
        return []
    query = (
        db.query(Transaction)
        .filter(
            or_(
                Transaction.sender_id.in_(account_ids),
                Transaction.receiver_id.in_(account_ids),
            )
        )
    )
    if tx_type:
        query = query.filter(Transaction.type == tx_type.upper())
    if q:
        query = query.filter(Transaction.description.ilike(f"%{q}%"))
    transactions = (
        query
        .order_by(Transaction.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return transactions

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
    limit: int = 100,
    offset: int = 0,
    tx_type: Optional[str] = Query(None, description="Filter by type: DEPOSIT, WITHDRAWAL, TRANSFER"),
    q: Optional[str] = Query(None, description="Search description (case-insensitive)"),
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

    query = (
        db.query(Transaction)
        .filter(
            or_(
                Transaction.sender_id == account.id,
                Transaction.receiver_id == account.id
            )
        )
    )
    if tx_type:
        query = query.filter(Transaction.type == tx_type.upper())
    if q:
        query = query.filter(Transaction.description.ilike(f"%{q}%"))
    transactions = (
        query
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
        _create_notification(db, current_user.id, "DEPOSIT", f"Deposit of ${payload.amount:,.2f}", f"To your {account.account_type.replace('_', ' ')} account.")
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

    # Idempotency: if a key was provided and an existing tx matches, return it
    if payload.idempotency_key:
        existing = db.query(Transaction).filter(Transaction.idempotency_key == payload.idempotency_key).first()
        if existing:
            db.refresh(sender)
            return {
                "status": "success",
                "message": "Idempotent replay.",
                "transaction_id": str(existing.id),
                "remaining_balance": float(sender.balance),
            }

    try:
        tx = perform_transfer(
            db,
            payload.sender_account_id,
            payload.receiver_account_id,
            payload.amount,
            payload.description,
            idempotency_key=payload.idempotency_key,
        )
        db.refresh(sender)
        _create_notification(db, current_user.id, "TRANSFER", f"Transfer of ${payload.amount:,.2f}", f"You transferred ${payload.amount:,.2f} to account {payload.receiver_account_id}.")
        return {
            "status": "success",
            "message": f"${payload.amount:,.2f} transferred successfully.",
            "transaction_id": str(tx.id),
            "remaining_balance": float(sender.balance)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/external-transfer")
def external_transfer(
    payload: ExternalTransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sender = db.query(Account).filter(
        Account.id == payload.sender_account_id,
        Account.user_id == current_user.id
    ).first()

    if not sender:
        raise HTTPException(status_code=403, detail="You do not own this account.")

    DAILY_LIMIT = Decimal("10000.00")
    if payload.amount > DAILY_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"External transfer exceeds daily limit of ${DAILY_LIMIT:,.2f}."
        )

    if len(payload.recipient_account_number.strip()) < 4:
        raise HTTPException(status_code=400, detail="Recipient account number must be at least 4 digits.")

    try:
        tx = perform_external_transfer(
            db,
            payload.sender_account_id,
            payload.amount,
            payload.recipient_name.strip(),
            payload.recipient_bank.strip(),
            payload.recipient_account_number.strip(),
            payload.routing_number.strip() if payload.routing_number else None,
            payload.description
        )
        db.refresh(sender)
        _create_notification(db, current_user.id, "TRANSFER", f"External transfer of ${payload.amount:,.2f}", f"Scheduled to {payload.recipient_bank}.")
        return {
            "status": "success",
            "message": f"${payload.amount:,.2f} scheduled to {payload.recipient_bank}.",
            "transaction_id": str(tx.id),
            "estimated_arrival": "1-3 business days",
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
        _create_notification(db, current_user.id, "WITHDRAWAL", f"Withdrawal of ${payload.amount:,.2f}", f"From your {account.account_type.replace('_', ' ')} account.")
        return {
            "status": "success",
            "message": f"${payload.amount:,.2f} withdrawn successfully.",
            "transaction_id": str(tx.id),
            "new_balance": float(account.balance)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
