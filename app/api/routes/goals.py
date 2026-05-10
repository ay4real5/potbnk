from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from decimal import Decimal

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Goal, Account, User
from app.schemas.accounts import GoalCreate, GoalResponse

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("/", response_model=List[GoalResponse])
def list_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()


@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(payload: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.target_amount <= 0:
        raise HTTPException(status_code=400, detail="Target amount must be greater than zero.")
    goal = Goal(
        id=uuid.uuid4(),
        user_id=current_user.id,
        name=payload.name.strip(),
        target_amount=payload.target_amount,
        current_amount=Decimal("0.00"),
        icon=payload.icon,
        color=payload.color,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/{goal_id}/contribute")
def contribute(goal_id: uuid.UUID, amount: Decimal, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    # Debit from a checking account
    account = db.query(Account).filter(Account.user_id == current_user.id, Account.account_type == "CHECKING").first()
    if not account:
        account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=400, detail="No account available to fund this goal.")
    if account.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient funds.")
    account.balance -= amount
    goal.current_amount += amount
    db.commit()
    db.refresh(goal)
    return {"status": "success", "goal_id": str(goal.id), "current_amount": float(goal.current_amount)}


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    # Return remaining funds to checking
    if goal.current_amount > 0:
        account = db.query(Account).filter(Account.user_id == current_user.id, Account.account_type == "CHECKING").first()
        if not account:
            account = db.query(Account).filter(Account.user_id == current_user.id).first()
        if account:
            account.balance += goal.current_amount
    db.delete(goal)
    db.commit()
    return None
