import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
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
	description = Column(Text, nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

	sender_account = relationship("Account", foreign_keys=[sender_id], back_populates="sent_transactions")
	receiver_account = relationship("Account", foreign_keys=[receiver_id], back_populates="received_transactions")


class AdminAuditLog(Base):
	__tablename__ = "admin_audit_logs"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
	actor_email = Column(String(255), nullable=False, index=True)
	action = Column(String(80), nullable=False, index=True)
	target_type = Column(String(80), nullable=False)
	target_id = Column(String(120), nullable=False, index=True)
	details = Column(Text, nullable=True)
	created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

