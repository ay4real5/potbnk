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
    status: Optional[str] = "POSTED"
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
    idempotency_key: Optional[str] = None

class ExternalTransferRequest(BaseModel):
    sender_account_id: uuid.UUID
    recipient_name: str
    recipient_bank: str
    recipient_account_number: str
    routing_number: Optional[str] = None
    amount: Decimal
    description: Optional[str] = "External transfer"
    idempotency_key: Optional[str] = None

class BeneficiaryCreate(BaseModel):
    nickname: Optional[str] = None
    recipient_name: str
    bank_name: str
    account_number: str
    routing_number: Optional[str] = None
    is_internal: bool = False

class BeneficiaryResponse(BaseModel):
    id: uuid.UUID
    nickname: Optional[str]
    recipient_name: str
    bank_name: str
    account_number: str
    routing_number: Optional[str]
    is_internal: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class ScheduledTransferCreate(BaseModel):
    sender_account_id: uuid.UUID
    receiver_account_id: Optional[uuid.UUID] = None
    external_recipient_name: Optional[str] = None
    external_bank_name: Optional[str] = None
    external_account_number: Optional[str] = None
    external_routing_number: Optional[str] = None
    amount: Decimal
    description: Optional[str] = "Scheduled transfer"
    frequency: str = "ONCE"
    next_run_at: datetime

    @field_validator("frequency")
    @classmethod
    def _validate_frequency(cls, v: str) -> str:
        allowed = {"ONCE", "WEEKLY", "BIWEEKLY", "MONTHLY"}
        v = v.upper()
        if v not in allowed:
            raise ValueError(f"frequency must be one of {', '.join(sorted(allowed))}")
        return v

class ScheduledTransferResponse(BaseModel):
    id: uuid.UUID
    sender_account_id: uuid.UUID
    receiver_account_id: Optional[uuid.UUID]
    external_recipient_name: Optional[str]
    external_bank_name: Optional[str]
    external_account_number: Optional[str]
    external_routing_number: Optional[str]
    amount: Decimal
    description: Optional[str]
    frequency: str
    next_run_at: datetime
    last_run_at: Optional[datetime]
    run_count: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class DepositRequest(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Deposit"

class WithdrawRequest(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    description: Optional[str] = "Withdrawal"

class GoalCreate(BaseModel):
    name: str
    target_amount: Decimal
    icon: Optional[str] = None
    color: Optional[str] = None

class GoalResponse(BaseModel):
    id: uuid.UUID
    name: str
    target_amount: Decimal
    current_amount: Decimal
    icon: Optional[str]
    color: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

class BillerCreate(BaseModel):
    name: str
    category: str
    account_number: Optional[str] = None
    nickname: Optional[str] = None

class BillerResponse(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    account_number: Optional[str]
    nickname: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

class BillPaymentCreate(BaseModel):
    biller_id: uuid.UUID
    account_id: uuid.UUID
    amount: Decimal
    scheduled_for: Optional[datetime] = None

class BillPaymentResponse(BaseModel):
    id: uuid.UUID
    biller_id: uuid.UUID
    account_id: uuid.UUID
    amount: Decimal
    status: str
    scheduled_for: Optional[datetime]
    paid_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}

class RoundUpRuleCreate(BaseModel):
    source_account_id: uuid.UUID
    goal_id: uuid.UUID

class RoundUpRuleResponse(BaseModel):
    id: uuid.UUID
    source_account_id: uuid.UUID
    goal_id: uuid.UUID
    enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}

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

class CardResponse(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    last4: str
    status: str
    daily_limit: Decimal
    expiry_month: int
    expiry_year: int
    created_at: datetime

    model_config = {"from_attributes": True}

class CardUpdate(BaseModel):
    status: Optional[str] = None
    daily_limit: Optional[Decimal] = None

class StatementResponse(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    month: int
    year: int
    url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

class BudgetAlertCreate(BaseModel):
    category: str
    limit_amount: Decimal

class BudgetAlertResponse(BaseModel):
    id: uuid.UUID
    category: str
    limit_amount: Decimal
    enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class ReferralCreate(BaseModel):
    referred_email: str

class ReferralResponse(BaseModel):
    id: uuid.UUID
    referred_email: str
    status: str
    bonus_amount: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}

class CheckDepositCreate(BaseModel):
    account_id: uuid.UUID
    amount: Decimal
    memo: Optional[str] = None

class CheckDepositResponse(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    amount: Decimal
    memo: Optional[str]
    hold_until: Optional[datetime]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
