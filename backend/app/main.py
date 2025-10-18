# app/main.py
from __future__ import annotations

import logging
from pathlib import Path
from typing import List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .core.config import settings

log = logging.getLogger(__name__)

# -----------------------------------------------------------------------------
# Create app
# -----------------------------------------------------------------------------
app = FastAPI(
    title="AI Product API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# -----------------------------------------------------------------------------
# CORS (allow comma-separated in .env)
# -----------------------------------------------------------------------------
allowed: List[str] = []
if settings.BACKEND_CORS_ORIGINS:
    if isinstance(settings.BACKEND_CORS_ORIGINS, str):
        allowed = [o.strip() for o in settings.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
    elif isinstance(settings.BACKEND_CORS_ORIGINS, list):
        allowed = settings.BACKEND_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed or ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Health
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"name": "AI Product API", "env": settings.ENV, "status": "ok"}

# -----------------------------------------------------------------------------
# API Routers
# -----------------------------------------------------------------------------
from .api.v1.search import router as search_router  # noqa: E402

app.include_router(search_router, prefix=settings.API_V1_STR)

try:
    from .api.v1.gen import router as gen_router  # noqa: E402

    app.include_router(gen_router, prefix=settings.API_V1_STR)
except Exception as e:
    log.warning(f"GenAI routes not loaded: {e}")

# -----------------------------------------------------------------------------
# Serve React SPA (built files copied to /app/frontend_build by Docker)
# -----------------------------------------------------------------------------
# In Dockerfile we copy the Vite build to: /app/frontend_build
DIST_DIR = Path(__file__).resolve().parents[1] / "frontend_build"
ASSETS_DIR = DIST_DIR / "assets"

if DIST_DIR.exists():
    # Serve static assets under /assets/*
    if ASSETS_DIR.exists():
        app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
    else:
        log.warning("SPA assets directory not found at %s", ASSETS_DIR)

    # Root: serve index.html
    @app.get("/")
    async def spa_root():
        return FileResponse(DIST_DIR / "index.html")

    # Catch-all for client-side routes (non-API)
    @app.get("/{full_path:path}")
    async def spa_catch_all(full_path: str, request: Request):
        # Let API calls fall through to real API routes
        if request.url.path.startswith(settings.API_V1_STR.rstrip("/")):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        return FileResponse(DIST_DIR / "index.html")
else:
    log.warning(
        "SPA build directory not found at %s. "
        "The API will run, but the frontend will not be served by FastAPI. "
        "Ensure your Dockerfile copies the frontend build to /app/frontend_build.",
        DIST_DIR,
    )
