from fastapi import APIRouter
from ...core.config import settings
from ...models.schemas import HealthOut

router = APIRouter()

@router.get("/health", response_model=HealthOut)
def health():
    return HealthOut(name=settings.APP_NAME, env=settings.APP_ENV, status="ok")
