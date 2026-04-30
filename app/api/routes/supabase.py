from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.auth import get_current_user
from app.core.config import get_settings
from app.core.supabase import get_supabase_service_client
from app.models.models import User

router = APIRouter(prefix="/integrations/supabase", tags=["Integrations"])


@router.get("/status")
def supabase_status(current_user: User = Depends(get_current_user)):
    settings = get_settings()

    if not settings.supabase_url:
        raise HTTPException(status_code=503, detail="Supabase URL is not configured.")

    if not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Supabase service role key is not configured.")

    try:
        # Lightweight admin call to verify service-role access without exposing secrets.
        client = get_supabase_service_client()
        users_response = client.auth.admin.list_users(page=1, per_page=1)
        sampled_users = None
        if hasattr(users_response, "users") and users_response.users is not None:
            sampled_users = len(users_response.users)
        elif isinstance(users_response, dict) and isinstance(users_response.get("users"), list):
            sampled_users = len(users_response["users"])
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Supabase check failed: {exc}") from exc

    return {
        "status": "ok",
        "project_url": settings.supabase_url,
        "service_role_configured": True,
        "admin_access_verified": True,
        "sampled_users": sampled_users,
        "requested_by": str(current_user.id),
    }
