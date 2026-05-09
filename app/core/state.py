"""
Shared in-memory application state.

These are intentionally module-level so all route modules reference the same
objects within a single process.  For multi-process / serverless deployments
swap these for DB-backed or cache-backed equivalents.
"""

# Set of user-id strings that have been locked by an admin.
locked_users: set = set()

# Map of reset-token strings → {"user_id": str, "expires_at": datetime}
reset_tokens: dict = {}
