from functools import lru_cache
from typing import Any

from app.core.config import get_settings


@lru_cache
def get_supabase_anon_client() -> Any:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise RuntimeError("Supabase anon client is not configured.")
    from supabase import create_client

    return create_client(settings.supabase_url, settings.supabase_publishable_key)


@lru_cache
def get_supabase_service_client() -> Any:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase service client is not configured.")
    from supabase import create_client

    return create_client(settings.supabase_url, settings.supabase_service_role_key)
