from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.models import Account, Transaction
from decimal import Decimal
import uuid

def perform_deposit(db: Session, account_id: uuid.UUID, amount: Decimal, description: str = "Deposit"):
    if amount <= 0:
        raise ValueError("Deposit amount must be greater than zero.")

    account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
    if not account:
        raise ValueError("Account not found.")

    account.balance += amount

    tx = Transaction(
        id=uuid.uuid4(),
        receiver_id=account.id,
        sender_id=None,
        amount=amount,
        description=description,
        type="DEPOSIT"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def perform_transfer(
    db: Session,
    sender_id: uuid.UUID,
    receiver_id: uuid.UUID,
    amount: Decimal,
    description: str = "Transfer"
):
    if amount <= 0:
        raise ValueError("Transfer amount must be greater than zero.")

    if sender_id == receiver_id:
        raise ValueError("Cannot transfer to the same account.")

    # Lock both rows to prevent race conditions (real bank behavior)
    sender = db.query(Account).filter(Account.id == sender_id).with_for_update().first()
    receiver = db.query(Account).filter(Account.id == receiver_id).with_for_update().first()

    if not sender:
        raise ValueError("Sender account not found.")
    if not receiver:
        raise ValueError("Receiver account not found.")
    if sender.balance < amount:
        raise ValueError("Insufficient funds.")

    # Double-entry: debit sender, credit receiver
    sender.balance -= amount
    receiver.balance += amount

    tx = Transaction(
        id=uuid.uuid4(),
        sender_id=sender_id,
        receiver_id=receiver_id,
        amount=amount,
        description=description,
        type="TRANSFER"
    )

    try:
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx
    except SQLAlchemyError:
        db.rollback()  # If anything fails, reverse everything
        raise ValueError("Transaction failed. Please try again.")

def perform_withdrawal(db: Session, account_id: uuid.UUID, amount: Decimal, description: str = "Withdrawal"):
    if amount <= 0:
        raise ValueError("Withdrawal amount must be greater than zero.")

    account = db.query(Account).filter(Account.id == account_id).with_for_update().first()
    if not account:
        raise ValueError("Account not found.")
    if account.balance < amount:
        raise ValueError("Insufficient funds.")

    account.balance -= amount

    tx = Transaction(
        id=uuid.uuid4(),
        sender_id=account.id,
        receiver_id=None,
        amount=amount,
        description=description,
        type="WITHDRAWAL"
    )
    try:
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx
    except SQLAlchemyError:
        db.rollback()
        raise ValueError("Withdrawal failed. Please try again.")
