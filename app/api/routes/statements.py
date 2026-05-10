from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Statement, Account, User
from app.schemas.accounts import StatementResponse

router = APIRouter(prefix="/statements", tags=["Statements"])


@router.get("/", response_model=List[StatementResponse])
def list_statements(account_id: uuid.UUID | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Statement).filter(Statement.user_id == current_user.id)
    if account_id:
        query = query.filter(Statement.account_id == account_id)
    return query.order_by(Statement.year.desc(), Statement.month.desc()).all()


@router.post("/", response_model=StatementResponse, status_code=201)
def generate_statement(account_id: uuid.UUID, month: int, year: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="You do not own this account.")
    if not (1 <= month <= 12):
        raise HTTPException(status_code=400, detail="Month must be 1-12.")
    existing = db.query(Statement).filter(
        Statement.account_id == account_id, Statement.month == month, Statement.year == year
    ).first()
    if existing:
        return existing
    stmt = Statement(
        id=uuid.uuid4(),
        user_id=current_user.id,
        account_id=account_id,
        month=month,
        year=year,
        url=f"/statements/{account_id}/{year}/{month}.pdf",
    )
    db.add(stmt)
    db.commit()
    db.refresh(stmt)
    return stmt
