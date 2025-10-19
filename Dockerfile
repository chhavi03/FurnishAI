# ===========================
# Stage 1 — Build React (Vite)
# ===========================
FROM node:20-alpine AS ui
WORKDIR /ui
# install deps
COPY frontend/package*.json ./
RUN npm ci
# build
COPY frontend/ .
RUN npm run build   # outputs to /ui/dist

# ==================================
# Stage 2 — Python runtime (FastAPI)
# ==================================
FROM python:3.10-slim AS api
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app
# build essentials (for some pip wheels)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# --- Flexible requirements location (root or backend/) ---
COPY backend/requirements.txt ./_req_backend.txt
COPY requirements.txt         ./_req_root.txt

RUN set -eux; \
    REQ_FILE=""; \
    if [ -s "_req_backend.txt" ]; then REQ_FILE="_req_backend.txt"; fi; \
    if [ -z "$REQ_FILE" ] && [ -s "_req_root.txt" ]; then REQ_FILE="_req_root.txt"; fi; \
    if [ -z "$REQ_FILE" ]; then echo "No requirements.txt found"; exit 2; fi; \
    echo "Using requirements: $REQ_FILE"; \
    pip install --no-cache-dir -r "$REQ_FILE"; \
    python - <<'PY'
import fastapi, uvicorn
print("deps_ok: fastapi + uvicorn installed")
PY

# copy backend code and static build
COPY backend/ ./backend/
COPY --from=ui /ui/dist ./frontend_build

# (Optional) Show versions in build log for sanity
RUN python - <<'PY'
import fastapi, uvicorn
print("fastapi", fastapi.__version__)
print("uvicorn", uvicorn.__version__)
PY

# Cloud platforms inject PORT; default to 8000 for local
EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
