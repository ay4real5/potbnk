from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import secrets
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import Card, Account, User
from app.schemas.accounts import CardResponse, CardUpdate

router = APIRouter(prefix="/cards", tags=["Card Management"])


def _generate_card():
    return {
        "last4": f"{secrets.randbelow(9000) + 1000}",
        "expiry_month": ((datetime.now(timezone.utc).month + 11) % 12) or 12,
        "expiry_year": datetime.now(timezone.utc).year + 3,
    }


@router.get("/", response_model=List[CardResponse])
def list_cards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Card).filter(Card.user_id == current_user.id).order_by(Card.created_at.desc()).all()


@router.post("/", response_model=CardResponse, status_code=201)
def create_card(account_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="You do not own this account.")
    card_data = _generate_card()
    card = Card(
        id=uuid.uuid4(),
        user_id=current_user.id,
        account_id=account_id,
        last4=card_data["last4"],
        expiry_month=card_data["expiry_month"],
        expiry_year=card_data["expiry_year"],
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.patch("/{card_id}", response_model=CardResponse)
def update_card(card_id: uuid.UUID, payload: CardUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found.")
    if payload.status is not None:
        card.status = payload.status
    if payload.daily_limit is not None:
        card.daily_limit = payload.daily_limit
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def delete_card(card_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found.")
    db.delete(card)
    db.commit()
    return None
