from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import models
from app.api.routes import auth, accounts

print(">> Initializing ProBank Database Tables...")
Base.metadata.create_all(bind=engine)
print(">> Tables Ready.")

app = FastAPI(
    title="ProBank International",
    description="Enterprise Banking API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$|https://.*\.app\.github\.dev$",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Register routers
app.include_router(auth.router)
app.include_router(accounts.router)


@app.get("/", tags=["System"])
def system_status():
    return {
        "status": "Online",
        "institution": "ProBank International",
        "version": "1.0.0",
        "api_docs": "/docs"
    }


@app.get("/health", tags=["System"])
def health():
    return {"status": "healthy"}
