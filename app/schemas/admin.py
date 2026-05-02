import uuid
from pydantic import BaseModel


class AdminOverview(BaseModel):
    users: int
    accounts: int
    transactions: int
    total_balances_usd: float


class AdminUserItem(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    created_at: str
    account_count: int
    total_balance: float


class AdminUserDetail(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    created_at: str
    accounts: list[dict]


class AdminPasswordResetRequest(BaseModel):
    new_password: str


class AdminAuditItem(BaseModel):
    id: uuid.UUID
    actor_email: str
    action: str
    target_type: str
    target_id: str
    details: str | None = None
    created_at: str


class AdminAccountCreditRequest(BaseModel):
    amount: float
    description: str | None = None
    account_id: uuid.UUID | None = None
    user_email: str | None = None
    account_type: str | None = None
