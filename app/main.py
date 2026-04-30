import logging
import os

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.models import models
from app.api.routes import auth, accounts, supabase

# ── Structured logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("hunch.main")

cfg = get_settings()


def _runtime_info():
    return {
        "service": "hunch-banking-api",
        "api_version": "1.0.0",
        "vercel_env": os.getenv("VERCEL_ENV", "local"),
        "vercel_region": os.getenv("VERCEL_REGION", "unknown"),
        "git_commit": os.getenv("VERCEL_GIT_COMMIT_SHA", "unknown"),
        "git_ref": os.getenv("VERCEL_GIT_COMMIT_REF", "unknown"),
    }


logger.info(
    "Startup diagnostics: %s",
    {
        **_runtime_info(),
        "debug": cfg.debug,
        "db_configured": bool(cfg.database_url),
        "supabase_url_configured": bool(cfg.supabase_url),
        "supabase_publishable_key_configured": bool(cfg.supabase_publishable_key),
        "supabase_service_role_key_configured": bool(cfg.supabase_service_role_key),
    },
)

if cfg.auto_create_tables:
    logger.info("AUTO_CREATE_TABLES enabled; schema init deferred to first DB request.")
else:
    logger.info("AUTO_CREATE_TABLES disabled; schema init skipped.")

app = FastAPI(
    title="Hunch Banking API",
    description="Full-stack banking platform API",
    version="1.0.0",
    docs_url="/docs" if cfg.debug else None,
    redoc_url="/redoc" if cfg.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=(
        r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"
        r"|https://.*\.app\.github\.dev$"
        r"|https://.*\.vercel\.app$"
    ),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ── Security headers ──────────────────────────────────────────────────────────
_SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
}

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response: Response = await call_next(request)
    for header, value in _SECURITY_HEADERS.items():
        response.headers[header] = value
    return response

# ── Request logging ───────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    response: Response = await call_next(request)
    logger.info(
        "%s %s → %s",
        request.method,
        request.url.path,
        response.status_code,
    )
    return response

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(supabase.router)


@app.get("/", tags=["System"])
def system_status():
    return {
        "status": "Online",
        "institution": "Hunch Banking",
        "version": "1.0.0",
        "api_docs": "/docs" if cfg.debug else "disabled",
    }


@app.get("/health", tags=["System"])
def health():
    return {"status": "healthy"}


@app.get("/version", tags=["System"])
def version():
    return {
        **_runtime_info(),
        "status": "ok",
    }
