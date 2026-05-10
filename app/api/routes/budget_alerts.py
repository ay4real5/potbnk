from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import BudgetAlert, User
from app.schemas.accounts import BudgetAlertCreate, BudgetAlertResponse

router = APIRouter(prefix="/budget-alerts", tags=["Budget Alerts"])


@router.get("/", response_model=List[BudgetAlertResponse])
def list_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(BudgetAlert).filter(BudgetAlert.user_id == current_user.id).all()


@router.post("/", response_model=BudgetAlertResponse, status_code=201)
def create_alert(payload: BudgetAlertCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.limit_amount <= 0:
        raise HTTPException(status_code=400, detail="Limit must be greater than zero.")
    alert = BudgetAlert(
        id=uuid.uuid4(),
        user_id=current_user.id,
        category=payload.category.strip(),
        limit_amount=payload.limit_amount,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}")
def toggle_alert(alert_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(BudgetAlert).filter(BudgetAlert.id == alert_id, BudgetAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.enabled = not alert.enabled
    db.commit()
    return {"status": "success", "enabled": alert.enabled}


@router.delete("/{alert_id}", status_code=204)
def delete_alert(alert_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(BudgetAlert).filter(BudgetAlert.id == alert_id, BudgetAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    db.delete(alert)
    db.commit()
    return None
