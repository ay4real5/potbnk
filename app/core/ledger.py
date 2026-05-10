from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.models import Account, Transaction, RoundUpRule, Goal
from decimal import Decimal
import uuid
import math


def _categorize(description: str, tx_type: str) -> str | None:
    d = (description or "").lower()
    if tx_type == "DEPOSIT":
        return "Income"
    if tx_type == "WITHDRAWAL":
        return "Cash Withdrawal"
    if tx_type == "EXTERNAL_TRANSFER":
        return "External Transfer"
    if tx_type == "TRANSFER":
        if "savings" in d or "checking" in d:
            return "Internal Transfer"
        return "Transfer"
    if "grocery" in d or "supermarket" in d or "walmart" in d or "kroger" in d:
        return "Groceries"
    if "restaurant" in d or "dining" in d or "uber eats" in d or "doordash" in d:
        return "Dining"
    if "gas" in d or "shell" in d or "exxon" in d or "bp" in d:
        return "Transportation"
    if "electric" in d or "water" in d or "internet" in d or "utility" in d or "phone" in d:
        return "Utilities"
    if "rent" in d or "mortgage" in d or "apartment" in d:
        return "Housing"
    if "insurance" in d or "healthcare" in d or "hospital" in d or "pharmacy" in d:
        return "Health"
    if "netflix" in d or "spotify" in d or "subscription" in d or "membership" in d:
        return "Subscriptions"
    if "amazon" in d or "shopping" in d or "retail" in d:
        return "Shopping"
    if "salary" in d or "payroll" in d or "direct deposit" in d:
        return "Income"
    return "Other"


def _apply_round_up(db: Session, user_id, source_account_id: uuid.UUID, amount: Decimal):
    rule = db.query(RoundUpRule).filter(
        RoundUpRule.user_id == user_id,
        RoundUpRule.source_account_id == source_account_id,
        RoundUpRule.enabled == True,
    ).first()
    if not rule:
        return None
    rounded = Decimal(math.ceil(float(amount)))
    spare = rounded - amount
    if spare <= 0:
        return None
    source = db.query(Account).filter(Account.id == source_account_id).with_for_update().first()
    goal = db.query(Goal).filter(Goal.id == rule.goal_id).with_for_update().first()
    if not source or not goal or source.balance < spare:
        return None
    source.balance -= spare
    goal.current_amount += spare
    tx = Transaction(
        id=uuid.uuid4(),
        sender_id=source_account_id,
        receiver_id=None,
        amount=spare,
        description=f"Round-up to {goal.name}",
        type="TRANSFER",
        category="Savings",
    )
    db.add(tx)
    return tx


def perform_deposit(db: Session, account_id: uuid.UUID, amount: Decimal, description: str = "Deposit"):
    if amount <= 0:
        raise ValueError("Deposit amount must be greater than zero.")
    if amount > Decimal("1000000.00"):
        raise ValueError("Single deposit cannot exceed $1,000,000.")

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
        type="DEPOSIT",
        category=_categorize(description, "DEPOSIT"),
    )
    db.add(tx)
    try:
        db.commit()
        db.refresh(tx)
        return tx
    except SQLAlchemyError:
        db.rollback()
        raise ValueError("Deposit failed. Please try again.")

def perform_transfer(
    db: Session,
    sender_id: uuid.UUID,
    receiver_id: uuid.UUID,
    amount: Decimal,
    description: str = "Transfer",
    idempotency_key: str | None = None,
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
        type="TRANSFER",
        idempotency_key=idempotency_key,
        category=_categorize(description, "TRANSFER"),
    )

    try:
        db.add(tx)
        # Round-up on debit side
        ru_tx = _apply_round_up(db, sender.user_id, sender_id, amount)
        db.commit()
        db.refresh(tx)
        return tx
    except SQLAlchemyError:
        db.rollback()
        raise ValueError("Transaction failed. Please try again.")

def perform_external_transfer(
    db: Session,
    sender_id: uuid.UUID,
    amount: Decimal,
    recipient_name: str,
    recipient_bank: str,
    recipient_account_number: str,
    routing_number: str | None = None,
    description: str = "External transfer"
):
    if amount <= 0:
        raise ValueError("Transfer amount must be greater than zero.")

    sender = db.query(Account).filter(Account.id == sender_id).with_for_update().first()

    if not sender:
        raise ValueError("Sender account not found.")
    if sender.balance < amount:
        raise ValueError("Insufficient funds.")

    sender.balance -= amount
    masked_account = recipient_account_number[-4:].rjust(4, "*")
    routing_label = f" Routing {routing_number[-4:].rjust(4, '*')}." if routing_number else ""
    tx_description = (
        f"{description or 'External transfer'} to {recipient_name} at "
        f"{recipient_bank} account {masked_account}.{routing_label}"
    )

    tx = Transaction(
        id=uuid.uuid4(),
        sender_id=sender_id,
        receiver_id=None,
        amount=amount,
        description=tx_description,
        type="EXTERNAL_TRANSFER",
        category=_categorize(tx_description, "EXTERNAL_TRANSFER"),
    )

    try:
        db.add(tx)
        ru_tx = _apply_round_up(db, sender.user_id, sender_id, amount)
        db.commit()
        db.refresh(tx)
        return tx
    except SQLAlchemyError:
        db.rollback()
        raise ValueError("External transfer failed. Please try again.")

# Daily withdrawal limit
_DAILY_WITHDRAWAL_LIMIT = Decimal("10000.00")


def perform_withdrawal(db: Session, account_id: uuid.UUID, amount: Decimal, description: str = "Withdrawal"):
    if amount <= 0:
        raise ValueError("Withdrawal amount must be greater than zero.")
    if amount > _DAILY_WITHDRAWAL_LIMIT:
        raise ValueError(f"Withdrawal exceeds daily limit of ${_DAILY_WITHDRAWAL_LIMIT:,.2f}.")

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
        type="WITHDRAWAL",
        category=_categorize(description, "WITHDRAWAL"),
    )
    try:
        db.add(tx)
        ru_tx = _apply_round_up(db, account.user_id, account_id, amount)
        db.commit()
        db.refresh(tx)
        return tx
    except SQLAlchemyError:
        db.rollback()
        raise ValueError("Withdrawal failed. Please try again.")
