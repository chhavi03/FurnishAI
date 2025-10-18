# app/api/v1/search.py
import logging
import io
import json
import requests
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from PIL import Image

from ...models.schemas import SearchRequest, SearchResponse, SearchHit
from ...services.embeddings import encode_text, encode_image, get_reranker
from ...services.vectorstore import text_index, image_index

logger = logging.getLogger(__name__)
router = APIRouter()  # <-- this must be defined before any @router.* decorators


# ----------------------------- TEXT SEARCH -----------------------------------
def _query_text_index(qvec: list[float], top_k: int, filters: dict | None):
    res = text_index.query(
        vector=qvec,
        top_k=top_k if top_k and top_k > 0 else 12,
        include_metadata=True,
        filter=filters or {},
        namespace="default",
    )
    return res.get("matches", [])


@router.post("/search", response_model=SearchResponse, tags=["search"])
def search(req: SearchRequest):
    try:
        qvec = encode_text(req.prompt)
        matches = _query_text_index(qvec, top_k=max(10, req.top_k or 12), filters=req.filters)

        # Optional rerank
        use_rerank = req.use_reranker if req.use_reranker is not None else False
        reranker = get_reranker() if use_rerank else None
        if reranker and matches:
            pairs = [(req.prompt, m["metadata"].get("title", "")) for m in matches]
            scores = reranker.predict(pairs).tolist()
            matches = [m for _, m in sorted(zip(scores, matches), key=lambda x: -x[0])]

        items = [
            SearchHit(id=m["id"], score=float(m.get("score", 0.0)), metadata=m.get("metadata", {}))
            for m in matches[: (req.top_k or 12)]
        ]
        return SearchResponse(items=items)
    except Exception as e:
        logger.exception("search failed")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------- IMAGE SEARCH -----------------------------------
@router.post("/search/image", response_model=SearchResponse, tags=["search"])
def search_by_image_url(
    image_url: str = Query(..., description="Public URL to a JPG/PNG/WEBP image"),
    top_k: int = Query(8, ge=1, le=100),
):
    """
    Pass an image URL; we fetch, embed with CLIP, and query the Pinecone image index.
    """
    if image_index is None:
        raise HTTPException(status_code=400, detail="Image index not available.")
    try:
        resp = requests.get(image_url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        img.thumbnail((256, 256), Image.BICUBIC)
        qvec = encode_image(img)
        res = image_index.query(vector=qvec, top_k=top_k, include_metadata=True, namespace="default")
        items = [SearchHit(id=m["id"], score=float(m.get("score", 0.0)), metadata=m.get("metadata", {}))
                 for m in res.get("matches", [])]
        return SearchResponse(items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"image_url failed: {e}")


@router.post("/search/image/upload", response_model=SearchResponse, tags=["search"])
async def search_by_image_upload(
    file: UploadFile = File(..., description="JPEG/PNG/WEBP image file"),
    top_k: int = Form(8),
):
    """
    Multipart form-data upload (key: file). Returns top_k visually similar items.
    """
    if image_index is None:
        raise HTTPException(status_code=400, detail="Image index not available.")
    try:
        raw = await file.read()
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        img.thumbnail((256, 256), Image.BICUBIC)
        qvec = encode_image(img)
        res = image_index.query(vector=qvec, top_k=top_k, include_metadata=True, namespace="default")
        items = [SearchHit(id=m["id"], score=float(m.get("score", 0.0)), metadata=m.get("metadata", {}))
                 for m in res.get("matches", [])]
        return SearchResponse(items=items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"upload failed: {e}")


@router.post("/search/image/upload-check", tags=["search"])
async def search_by_image_upload_check(
    file: UploadFile = File(..., description="JPEG/PNG/WEBP image file"),
    top_k: int = Form(8),
    threshold: float = Form(0.75, description="Cosine similarity threshold [0..1]"),
    filters: Optional[str] = Form(
        None,
        description='Optional Pinecone metadata filter as JSON, e.g. {"brand":{"$ne":""},"price":{"$gt":0}}'
    ),
):
    """
    Upload an image; downscale, embed with CLIP, query Pinecone image index, and
    return matches plus a boolean 'found_similar' if best score >= threshold.
    """
    import time
    t0 = time.perf_counter()

    if image_index is None:
        raise HTTPException(status_code=400, detail="Image index not available.")

    raw = await file.read()
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid image file.")

    # Downscale for speed on CPU
    img.thumbnail((256, 256), Image.BICUBIC)

    pinecone_filter: Dict[str, Any] = {}
    if filters:
        try:
            pinecone_filter = json.loads(filters)
            if not isinstance(pinecone_filter, dict):
                raise ValueError("filters must be a JSON object")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid filters JSON: {e}")

    t1 = time.perf_counter()
    qvec = encode_image(img)
    t2 = time.perf_counter()

    res = image_index.query(
        vector=qvec,
        top_k=top_k if top_k and top_k > 0 else 8,
        include_metadata=True,
        namespace="default",
        filter=pinecone_filter or {},
    )
    matches = res.get("matches", [])
    items = [SearchHit(id=m["id"], score=float(m.get("score", 0.0)), metadata=m.get("metadata", {}))
             for m in matches]
    best = items[0] if items else None
    found_similar = bool(best and best.score >= threshold)
    t3 = time.perf_counter()

    return {
        "found_similar": found_similar,
        "threshold": threshold,
        "best_match": best.model_dump() if best else None,
        "items": [i.model_dump() for i in items],
        "timings_ms": {
            "total": round((t3 - t0) * 1000, 1),
            "open_resize": round((t1 - t0) * 1000, 1),
            "embed": round((t2 - t1) * 1000, 1),
            "pinecone_query": round((t3 - t2) * 1000, 1),
        },
    }
