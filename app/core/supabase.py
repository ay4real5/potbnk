from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_anon_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise RuntimeError("Supabase anon client is not configured.")
    return create_client(settings.supabase_url, settings.supabase_publishable_key)


@lru_cache
def get_supabase_service_client() -> Client:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase service client is not configured.")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
