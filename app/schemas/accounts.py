from pydantic import BaseModel, field_validator
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

    model_config = {"from_attributes": True}

class TransactionResponse(BaseModel):
    id: uuid.UUID
    amount: Decimal
    type: str
    description: Optional[str]
    created_at: datetime
    sender_id: Optional[uuid.UUID]
    receiver_id: Optional[uuid.UUID]

    model_config = {"from_attributes": True}

class TransferRequest(BaseModel):
    sender_account_id: uuid.UUID
    receiver_account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Transfer"

class ExternalTransferRequest(BaseModel):
    sender_account_id: uuid.UUID
    recipient_name: str
    recipient_bank: str
    recipient_account_number: str
    routing_number: Optional[str] = None
    amount: Decimal
    description: Optional[str] = "External transfer"

class DepositRequest(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Deposit"

class WithdrawRequest(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Withdrawal"

class OpenAccountRequest(BaseModel):
    account_type: str

    @field_validator('account_type')
    @classmethod
    def validate_account_type(cls, v: str) -> str:
        allowed = {"CHECKING", "SAVINGS", "BUSINESS_CHECKING", "MONEY_MARKET"}
        normalized = v.upper().replace(" ", "_")
        if normalized not in allowed:
            raise ValueError(f"account_type must be one of: {', '.join(sorted(allowed))}")
        return normalized
