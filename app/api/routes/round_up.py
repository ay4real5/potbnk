from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import RoundUpRule, Account, Goal, User
from app.schemas.accounts import RoundUpRuleCreate, RoundUpRuleResponse

router = APIRouter(prefix="/round-up", tags=["Round-up Savings"])


@router.get("/", response_model=List[RoundUpRuleResponse])
def list_rules(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(RoundUpRule).filter(RoundUpRule.user_id == current_user.id).all()


@router.post("/", response_model=RoundUpRuleResponse, status_code=201)
def create_rule(payload: RoundUpRuleCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == payload.source_account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="You do not own the source account.")
    goal = db.query(Goal).filter(Goal.id == payload.goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    # Upsert: if a rule exists for this account+goal, just enable it
    existing = db.query(RoundUpRule).filter(
        RoundUpRule.user_id == current_user.id,
        RoundUpRule.source_account_id == payload.source_account_id,
        RoundUpRule.goal_id == payload.goal_id,
    ).first()
    if existing:
        existing.enabled = True
        db.commit()
        db.refresh(existing)
        return existing
    rule = RoundUpRule(
        id=uuid.uuid4(),
        user_id=current_user.id,
        source_account_id=payload.source_account_id,
        goal_id=payload.goal_id,
        enabled=True,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.patch("/{rule_id}")
def toggle_rule(rule_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rule = db.query(RoundUpRule).filter(RoundUpRule.id == rule_id, RoundUpRule.user_id == current_user.id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")
    rule.enabled = not rule.enabled
    db.commit()
    db.refresh(rule)
    return {"status": "success", "enabled": rule.enabled}


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rule = db.query(RoundUpRule).filter(RoundUpRule.id == rule_id, RoundUpRule.user_id == current_user.id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")
    db.delete(rule)
    db.commit()
    return None
