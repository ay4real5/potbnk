import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
	__tablename__ = "users"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	full_name = Column(String(255), nullable=False)
	email = Column(String(255), unique=True, nullable=False, index=True)
	hashed_password = Column(String(255), nullable=False)
	totp_secret = Column(String(255), nullable=True)
	totp_enabled = Column(Boolean, default=False, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

	accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")


class Account(Base):
	__tablename__ = "accounts"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	account_number = Column(String(20), unique=True, nullable=False, index=True)
	account_type = Column(String(20), nullable=False)
	balance = Column(Numeric(12, 2), default=0.00, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

	user = relationship("User", back_populates="accounts")
	sent_transactions = relationship("Transaction", foreign_keys="Transaction.sender_id", back_populates="sender_account")
	received_transactions = relationship("Transaction", foreign_keys="Transaction.receiver_id", back_populates="receiver_account")


class Transaction(Base):
	__tablename__ = "transactions"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	sender_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True, index=True)
	receiver_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True, index=True)
	amount = Column(Numeric(12, 2), nullable=False)
	type = Column(String(20), nullable=False)
	category = Column(String(40), nullable=True, index=True)
	status = Column(String(20), default="POSTED", nullable=False, index=True)
	idempotency_key = Column(String(80), nullable=True, unique=True, index=True)
	description = Column(Text, nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

	sender_account = relationship("Account", foreign_keys=[sender_id], back_populates="sent_transactions")
	receiver_account = relationship("Account", foreign_keys=[receiver_id], back_populates="received_transactions")


class Beneficiary(Base):
	__tablename__ = "beneficiaries"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	nickname = Column(String(80), nullable=True)
	recipient_name = Column(String(120), nullable=False)
	bank_name = Column(String(120), nullable=False)
	account_number = Column(String(40), nullable=False)
	routing_number = Column(String(20), nullable=True)
	is_internal = Column(Boolean, default=False, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class ScheduledTransfer(Base):
	__tablename__ = "scheduled_transfers"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	sender_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	# Internal: receiver_account_id set. External: external_* fields set.
	receiver_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True)
	external_recipient_name = Column(String(120), nullable=True)
	external_bank_name = Column(String(120), nullable=True)
	external_account_number = Column(String(40), nullable=True)
	external_routing_number = Column(String(20), nullable=True)
	amount = Column(Numeric(12, 2), nullable=False)
	description = Column(Text, nullable=True)
	frequency = Column(String(20), default="ONCE", nullable=False)  # ONCE, WEEKLY, BIWEEKLY, MONTHLY
	next_run_at = Column(DateTime(timezone=True), nullable=False, index=True)
	last_run_at = Column(DateTime(timezone=True), nullable=True)
	run_count = Column(Integer, default=0, nullable=False)
	status = Column(String(20), default="ACTIVE", nullable=False, index=True)  # ACTIVE, PAUSED, COMPLETED, FAILED
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class LoginAttempt(Base):
	__tablename__ = "login_attempts"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
	email = Column(String(255), nullable=False, index=True)
	ip_address = Column(String(45), nullable=False)
	user_agent = Column(String(500), nullable=True)
	device = Column(String(120), nullable=True)
	success = Column(Boolean, default=False, nullable=False)
	failure_reason = Column(String(120), nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Notification(Base):
	__tablename__ = "notifications"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	category = Column(String(40), nullable=False, index=True)  # SECURITY, TRANSFER, DEPOSIT, etc.
	title = Column(String(200), nullable=False)
	body = Column(Text, nullable=False)
	is_read = Column(Boolean, default=False, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Dispute(Base):
	__tablename__ = "disputes"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False, index=True)
	reason = Column(Text, nullable=False)
	status = Column(String(20), default="OPEN", nullable=False, index=True)  # OPEN, REVIEWING, RESOLVED, REJECTED
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Goal(Base):
	__tablename__ = "goals"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	name = Column(String(80), nullable=False)
	target_amount = Column(Numeric(12, 2), nullable=False)
	current_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
	icon = Column(String(40), nullable=True)
	color = Column(String(20), nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Biller(Base):
	__tablename__ = "billers"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	name = Column(String(120), nullable=False)
	category = Column(String(40), nullable=False)
	account_number = Column(String(40), nullable=True)
	nickname = Column(String(80), nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class BillPayment(Base):
	__tablename__ = "bill_payments"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	biller_id = Column(UUID(as_uuid=True), ForeignKey("billers.id"), nullable=False, index=True)
	account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	amount = Column(Numeric(12, 2), nullable=False)
	status = Column(String(20), default="SCHEDULED", nullable=False)
	scheduled_for = Column(DateTime(timezone=True), nullable=True)
	paid_at = Column(DateTime(timezone=True), nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class RoundUpRule(Base):
	__tablename__ = "round_up_rules"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	source_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=False, index=True)
	enabled = Column(Boolean, default=True, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Card(Base):
	__tablename__ = "cards"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	last4 = Column(String(4), nullable=False)
	status = Column(String(20), default="ACTIVE", nullable=False, index=True)  # ACTIVE, FROZEN, LOCKED
	daily_limit = Column(Numeric(12, 2), default=5000.00, nullable=False)
	expiry_month = Column(Integer, nullable=False)
	expiry_year = Column(Integer, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Statement(Base):
	__tablename__ = "statements"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	month = Column(Integer, nullable=False)
	year = Column(Integer, nullable=False)
	url = Column(String(500), nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class BudgetAlert(Base):
	__tablename__ = "budget_alerts"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	category = Column(String(40), nullable=False, index=True)
	limit_amount = Column(Numeric(12, 2), nullable=False)
	enabled = Column(Boolean, default=True, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class Referral(Base):
	__tablename__ = "referrals"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	referred_email = Column(String(255), nullable=False, index=True)
	status = Column(String(20), default="PENDING", nullable=False, index=True)  # PENDING, COMPLETED
	bonus_amount = Column(Numeric(12, 2), default=25.00, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class CheckDeposit(Base):
	__tablename__ = "check_deposits"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	amount = Column(Numeric(12, 2), nullable=False)
	memo = Column(Text, nullable=True)
	hold_until = Column(DateTime(timezone=True), nullable=True)
	status = Column(String(20), default="PENDING", nullable=False, index=True)  # PENDING, CLEARED
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class LoanApplication(Base):
	__tablename__ = "loan_applications"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	loan_type = Column(String(40), nullable=False)  # PERSONAL, HOME, AUTO, STUDENT
	amount = Column(Numeric(12, 2), nullable=False)
	term_months = Column(Integer, nullable=False)
	purpose = Column(Text, nullable=True)
	annual_income = Column(Numeric(12, 2), nullable=True)
	status = Column(String(20), default="PENDING", nullable=False, index=True)  # PENDING, APPROVED, REJECTED, DISBURSED
	rate = Column(Numeric(5, 2), nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class WireTransfer(Base):
	__tablename__ = "wire_transfers"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
	sender_account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False, index=True)
	amount = Column(Numeric(12, 2), nullable=False)
	recipient_name = Column(String(120), nullable=False)
	recipient_bank = Column(String(120), nullable=False)
	recipient_account_number = Column(String(40), nullable=False)
	swift_code = Column(String(20), nullable=True)
	reference = Column(String(80), nullable=True)
	status = Column(String(20), default="PENDING", nullable=False, index=True)  # PENDING, COMPLETED, FAILED
	fee = Column(Numeric(12, 2), default=25.00, nullable=False)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)


class AdminAuditLog(Base):
	__tablename__ = "admin_audit_logs"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	actor_email = Column(String(255), nullable=False, index=True)
	action = Column(String(80), nullable=False, index=True)
	target_type = Column(String(80), nullable=False)
	target_id = Column(String(120), nullable=False, index=True)
	details = Column(Text, nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

