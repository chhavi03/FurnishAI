import logging
from PIL import Image
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from ..core.config import settings

logger = logging.getLogger(__name__)

def _pick_device() -> str:
    if settings.DEVICE == "cpu": return "cpu"
    if settings.DEVICE == "cuda": return "cuda"
    return "cuda" if torch.cuda.is_available() else "cpu"

_DEVICE = _pick_device()
logger.info(f"Loading ST models on device: {_DEVICE}")

_text_model = SentenceTransformer(settings.TEXT_MODEL, device=_DEVICE)
_img_model = SentenceTransformer(settings.IMAGE_MODEL, device=_DEVICE)

def encode_text(text: str) -> list[float]:
    vec = _text_model.encode([text], normalize_embeddings=True, convert_to_numpy=True)[0]
    return vec.tolist()

def encode_image(pil_image: Image.Image) -> list[float]:
    vec = _img_model.encode([pil_image], normalize_embeddings=True, convert_to_numpy=True)[0]
    return vec.tolist()

_reranker = None
def get_reranker():
    global _reranker
    if _reranker is not None:
        return _reranker
    if not settings.USE_RERANKER:
        return None
    try:
        from sentence_transformers import CrossEncoder
        _reranker = CrossEncoder(settings.RERANKER_MODEL, device=_DEVICE)
        return _reranker
    except Exception as e:
        logger.warning(f"Reranker not available: {e}")
        return None
