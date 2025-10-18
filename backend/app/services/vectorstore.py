import logging
from pinecone import Pinecone, ServerlessSpec
from ..core.config import settings

logger = logging.getLogger(__name__)

_pc = Pinecone(api_key=settings.PINECONE_API_KEY)

def _region_from_env(env_str: str) -> str:
    parts = env_str.split("-")
    return "-".join(parts[:3]) if len(parts) >= 3 else "us-east-1"

_region = _region_from_env(settings.PINECONE_ENV)

# Open indexes you already created via notebooks
text_index  = _pc.Index(settings.PINECONE_TEXT_INDEX)
image_index = _pc.Index(settings.PINECONE_IMAGE_INDEX)
