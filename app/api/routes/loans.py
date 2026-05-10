from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from decimal import Decimal

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import LoanApplication, User
from app.schemas.accounts import LoanCreate, LoanResponse

router = APIRouter(prefix="/loans", tags=["Lending"])


@router.get("/", response_model=List[LoanResponse])
def list_loans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(LoanApplication).filter(LoanApplication.user_id == current_user.id).order_by(LoanApplication.created_at.desc()).all()


@router.post("/", response_model=LoanResponse, status_code=201)
def apply_loan(payload: LoanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if payload.term_months < 6 or payload.term_months > 360:
        raise HTTPException(status_code=400, detail="Term must be between 6 and 360 months.")
    allowed = {"PERSONAL", "HOME", "AUTO", "STUDENT"}
    normalized = payload.loan_type.upper().replace(" ", "_")
    if normalized not in allowed:
        raise HTTPException(status_code=400, detail=f"loan_type must be one of: {', '.join(sorted(allowed))}")

    # Simple auto-rate based on amount + term
    base_rate = Decimal("5.99")
    if payload.amount > Decimal("50000"):
        base_rate = Decimal("7.49")
    if payload.term_months > 120:
        base_rate += Decimal("0.50")

    loan = LoanApplication(
        id=uuid.uuid4(),
        user_id=current_user.id,
        loan_type=normalized,
        amount=payload.amount,
        term_months=payload.term_months,
        purpose=payload.purpose.strip() if payload.purpose else None,
        annual_income=payload.annual_income,
        rate=base_rate,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(loan_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_id, LoanApplication.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found.")
    return loan
