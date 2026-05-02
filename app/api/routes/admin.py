from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.models import Account, AdminAuditLog, Transaction, User
from app.schemas.admin import AdminAccountCreditRequest

router = APIRouter(prefix="/admin", tags=["Admin"])


def _require_admin(current_user):
    if not bool(getattr(current_user, "is_admin", False)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )


@router.post("/credit")
def credit_user_account(
    payload: AdminAccountCreditRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)

    amount = Decimal(str(payload.amount))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    target_account = None

    if payload.account_id:
        target_account = db.query(Account).filter(Account.id == payload.account_id).first()
        if not target_account:
            raise HTTPException(status_code=404, detail="Account not found.")
    else:
        if not payload.user_email or not payload.account_type:
            raise HTTPException(
                status_code=400,
                detail="Provide account_id or both user_email and account_type.",
            )

        normalized_email = payload.user_email.strip().lower()
        account_type = payload.account_type.strip().upper()

        target_user = db.query(User).filter(User.email == normalized_email).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found.")

        target_account = (
            db.query(Account)
            .filter(Account.user_id == target_user.id, Account.account_type == account_type)
            .order_by(Account.created_at.asc())
            .first()
        )
        if not target_account:
            raise HTTPException(
                status_code=404,
                detail="No account found for this user and account type.",
            )

    target_account.balance = Decimal(target_account.balance) + amount

    tx = Transaction(
        sender_id=None,
        receiver_id=target_account.id,
        amount=amount,
        type="ADMIN_CREDIT",
        description=(payload.description or "Admin credit").strip(),
    )
    db.add(tx)

    db.add(
        AdminAuditLog(
            actor_email=getattr(current_user, "email", "unknown"),
            action="credit_account",
            target_type="account",
            target_id=str(target_account.id),
            details=(
                f"amount={amount} account_number={target_account.account_number} "
                f"account_type={target_account.account_type}"
            ),
        )
    )

    db.commit()
    db.refresh(target_account)

    return {
        "status": "success",
        "message": "Account credited successfully.",
        "account_id": str(target_account.id),
        "account_number": target_account.account_number,
        "account_type": target_account.account_type,
        "new_balance": float(target_account.balance),
        "credited_amount": float(amount),
    }
