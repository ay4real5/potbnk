import uuid
from typing import Optional
from pydantic import BaseModel


class AdminOverview(BaseModel):
    users: int
    accounts: int
    transactions: int
    total_balances_usd: float
    recent_activity_7d: int


class AdminUserItem(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    created_at: str
    account_count: int
    total_balance: float
    is_locked: bool


class AdminUserDetail(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    created_at: str
    accounts: list[dict]
    is_locked: bool


class AdminPasswordResetRequest(BaseModel):
    new_password: str


class AdminAuditItem(BaseModel):
    id: uuid.UUID
    actor_email: str
    action: str
    target_type: str
    target_id: str
    details: Optional[str] = None
    created_at: str


class AdminAccountCreditRequest(BaseModel):
    amount: float
    description: Optional[str] = None
    account_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    account_type: Optional[str] = None


class AdminDebitRequest(BaseModel):
    amount: float
    description: Optional[str] = None
    user_email: str
    account_type: str
