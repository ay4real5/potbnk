import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.core.security import get_password_hash
from app.core.state import locked_users as _locked_users
from app.models.models import Account, AdminAuditLog, Transaction, User, LoanApplication, Dispute, WireTransfer, Card
from app.schemas.admin import (
    AdminAccountCreditRequest,
    AdminAuditItem,
    AdminDebitRequest,
    AdminOverview,
    AdminPasswordResetRequest,
    AdminUserDetail,
    AdminUserItem,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


def _require_admin(current_user):
    if not bool(getattr(current_user, "is_admin", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


def _audit(db: Session, actor: str, action: str, target_type: str, target_id: str, details: str = ""):
    db.add(AdminAuditLog(
        actor_email=actor,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        details=details,
    ))


# ── Overview ──────────────────────────────────────────────────────────────────
@router.get("/overview")
def overview(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    since = datetime.now(timezone.utc) - timedelta(days=7)
    users = db.query(func.count(User.id)).scalar()
    accounts = db.query(func.count(Account.id)).scalar()
    transactions = db.query(func.count(Transaction.id)).scalar()
    total_balance = db.query(func.coalesce(func.sum(Account.balance), 0)).scalar()
    recent = db.query(func.count(Transaction.id)).filter(Transaction.created_at >= since).scalar()
    return {
        "users": users,
        "accounts": accounts,
        "transactions": transactions,
        "total_balances_usd": float(total_balance),
        "recent_activity_7d": recent,
    }


# ── User search & list ────────────────────────────────────────────────────────
@router.get("/users")
def list_users(
    q: str = Query("", description="Search name or email"),
    limit: int = 50,
    offset: int = 0,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(User.full_name.ilike(like), User.email.ilike(like)))
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    result = []
    for u in users:
        accts = db.query(Account).filter(Account.user_id == u.id).all()
        total_bal = sum(float(a.balance) for a in accts)
        result.append({
            "id": str(u.id),
            "full_name": u.full_name,
            "email": u.email,
            "created_at": str(u.created_at),
            "account_count": len(accts),
            "total_balance": total_bal,
            "is_locked": str(u.id) in _locked_users,
        })
    return result


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    accts = db.query(Account).filter(Account.user_id == user.id).all()
    accounts_data = [
        {
            "id": str(a.id),
            "account_number": a.account_number,
            "account_type": a.account_type,
            "balance": float(a.balance),
            "created_at": str(a.created_at),
        }
        for a in accts
    ]
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "created_at": str(user.created_at),
        "accounts": accounts_data,
        "is_locked": str(user.id) in _locked_users,
    }


# ── Lock / unlock user ────────────────────────────────────────────────────────
@router.post("/users/{user_id}/lock")
def lock_user(user_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    _locked_users.add(str(user.id))
    _audit(db, getattr(current_user, "email", "?"), "lock_user", "user", user.id, f"email={user.email}")
    db.commit()
    return {"status": "success", "message": f"Account for {user.email} has been locked."}


@router.post("/users/{user_id}/unlock")
def unlock_user(user_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    _locked_users.discard(str(user.id))
    _audit(db, getattr(current_user, "email", "?"), "unlock_user", "user", user.id, f"email={user.email}")
    db.commit()
    return {"status": "success", "message": f"Account for {user.email} has been unlocked."}


# ── Force password reset ────────────────────────────────────────────────────
@router.post("/users/{user_id}/reset-password")
def admin_reset_password(
    user_id: str,
    payload: AdminPasswordResetRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.hashed_password = get_password_hash(payload.new_password)
    _audit(db, getattr(current_user, "email", "?"), "reset_password", "user", user.id, f"email={user.email}")
    db.commit()
    return {"status": "success", "message": f"Password reset for {user.email}."}


# ── Audit log ─────────────────────────────────────────────────────────────────
@router.get("/audit-log")
def get_audit_log(
    limit: int = 100,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    logs = (
        db.query(AdminAuditLog)
        .order_by(AdminAuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(l.id),
            "actor_email": l.actor_email,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "created_at": str(l.created_at),
        }
        for l in logs
    ]




# ── Credit / Debit ────────────────────────────────────────────────────────────
def _resolve_account(db, payload_account_id, payload_email, payload_type):
    if payload_account_id:
        acct = db.query(Account).filter(Account.id == payload_account_id).first()
        if not acct:
            raise HTTPException(status_code=404, detail="Account not found.")
        return acct
    if not payload_email or not payload_type:
        raise HTTPException(status_code=400, detail="Provide account_id or user_email + account_type.")
    user = db.query(User).filter(User.email == payload_email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    acct = (
        db.query(Account)
        .filter(Account.user_id == user.id, Account.account_type == payload_type.strip().upper())
        .order_by(Account.created_at.asc())
        .first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="No account found for this user and account type.")
    return acct


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
    acct = _resolve_account(db, payload.account_id, payload.user_email, payload.account_type)
    acct.balance = Decimal(acct.balance) + amount
    db.add(Transaction(sender_id=None, receiver_id=acct.id, amount=amount, type="ADMIN_CREDIT",
        description=(payload.description or "Transfer in").strip()))
    _audit(db, getattr(current_user, "email", "?"), "credit_account", "account", acct.id,
        f"amount={amount} account_number={acct.account_number} type={acct.account_type}")
    db.commit()
    db.refresh(acct)
    return {"status": "success", "message": "Account credited.", "account_id": str(acct.id),
        "account_number": acct.account_number, "account_type": acct.account_type,
        "new_balance": float(acct.balance), "credited_amount": float(amount)}


@router.post("/debit")
def debit_user_account(
    payload: AdminDebitRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)
    amount = Decimal(str(payload.amount))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    user = db.query(User).filter(User.email == payload.user_email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    acct = (
        db.query(Account)
        .filter(Account.user_id == user.id, Account.account_type == payload.account_type.strip().upper())
        .order_by(Account.created_at.asc()).first()
    )
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found for this user and type.")
    if Decimal(acct.balance) < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance for debit.")
    acct.balance = Decimal(acct.balance) - amount
    db.add(Transaction(sender_id=acct.id, receiver_id=None, amount=amount, type="ADMIN_DEBIT",
        description=(payload.description or "Admin debit").strip()))
    _audit(db, getattr(current_user, "email", "?"), "debit_account", "account", acct.id,
        f"amount={amount} account_number={acct.account_number} type={acct.account_type}")
    db.commit()
    db.refresh(acct)
    return {"status": "success", "message": "Account debited.", "account_id": str(acct.id),
        "account_number": acct.account_number, "account_type": acct.account_type,
        "new_balance": float(acct.balance), "debited_amount": float(amount)}


# ── Loan Applications ──────────────────────────────────────────────────────────
@router.get("/loans")
def admin_loans(status: str | None = None, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    q = db.query(LoanApplication)
    if status:
        q = q.filter(LoanApplication.status == status.upper())
    return q.order_by(LoanApplication.created_at.desc()).all()


@router.patch("/loans/{loan_id}")
def update_loan_status(loan_id: uuid.UUID, status: str, rate: float | None = None, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found.")
    loan.status = status.upper()
    if rate is not None:
        loan.rate = Decimal(str(rate))
    db.commit()
    db.refresh(loan)
    _audit(db, getattr(current_user, "email", "?"), "update_loan_status", "loan", loan_id, f"status={status}")
    return loan


# ── Disputes ───────────────────────────────────────────────────────────────────
@router.get("/disputes")
def admin_disputes(status: str | None = None, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    q = db.query(Dispute)
    if status:
        q = q.filter(Dispute.status == status.upper())
    return q.order_by(Dispute.created_at.desc()).all()


@router.patch("/disputes/{dispute_id}")
def update_dispute_status(dispute_id: uuid.UUID, status: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found.")
    dispute.status = status.upper()
    db.commit()
    db.refresh(dispute)
    _audit(db, getattr(current_user, "email", "?"), "update_dispute_status", "dispute", dispute_id, f"status={status}")
    return dispute


# ── Wire Transfers ─────────────────────────────────────────────────────────────
@router.get("/wire-transfers")
def admin_wires(status: str | None = None, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    q = db.query(WireTransfer)
    if status:
        q = q.filter(WireTransfer.status == status.upper())
    return q.order_by(WireTransfer.created_at.desc()).all()


# ── Cards ──────────────────────────────────────────────────────────────────────
@router.get("/cards")
def admin_cards(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(current_user)
    return db.query(Card).order_by(Card.created_at.desc()).all()
