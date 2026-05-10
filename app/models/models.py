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


class AdminAuditLog(Base):
	__tablename__ = "admin_audit_logs"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	actor_email = Column(String(255), nullable=False, index=True)
	action = Column(String(80), nullable=False, index=True)
	target_type = Column(String(80), nullable=False)
	target_id = Column(String(120), nullable=False, index=True)
	details = Column(Text, nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

