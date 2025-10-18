# ---------- Stage 1: build the React app ----------
FROM node:20-alpine AS ui
WORKDIR /ui
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---------- Stage 2: Python runtime ----------
FROM python:3.10-slim AS api
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/.cache/huggingface

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# ✅ COPY the correct requirements file
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
 && python -c "import fastapi, uvicorn; print('deps_ok')"

COPY backend/ ./backend/
COPY --from=ui /ui/dist ./frontend_build

EXPOSE 8080
CMD ["sh","-c","uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
