from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
import uuid
from datetime import datetime

class AccountResponse(BaseModel):
    id: uuid.UUID
    account_number: str
    account_type: str
    balance: Decimal
    currency: str = "USD"

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: uuid.UUID
    amount: Decimal
    type: str
    description: Optional[str]
    created_at: datetime
    sender_id: Optional[uuid.UUID]
    receiver_id: Optional[uuid.UUID]

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    sender_account_id: uuid.UUID
    receiver_account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Transfer"

class DepositRequest(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Deposit"

class WithdrawRequest(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Withdrawal"
