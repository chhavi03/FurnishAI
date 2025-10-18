import logging, io, base64
from typing import Literal
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from PIL import Image

from ...models.schemas import SearchHit, SimilarResponse
from ...services.embeddings import encode_text, encode_image
from ...services.vectorstore import text_index, image_index

logger = logging.getLogger(__name__)
router = APIRouter()

class ImageQuery(BaseModel):
    image_b64: str  # base64-encoded image bytes (JPEG/PNG)

@router.get("/similar/{uniq_id}", response_model=SimilarResponse)
def similar_by_id(
    uniq_id: str,
    modality: Literal["text","image"] = Query("text"),
    top_k: int = Query(12, ge=1, le=100)
):
    try:
        index = text_index if modality == "text" else image_index
        if index is None and modality == "image":
            raise HTTPException(status_code=400, detail="Image index not available.")
        if modality == "text":
            get_res = index.fetch(ids=[uniq_id], namespace="default")
            md = None
            for vec in get_res.get("vectors", {}).values():
                md = vec.get("metadata")
            if not md:
                raise HTTPException(status_code=404, detail="Item not found in text index")
            parts = [md.get("title",""), md.get("brand","")]
            if isinstance(md.get("categories"), list):
                parts += md["categories"]
            q = " | ".join([p for p in parts if p])
            qvec = encode_text(q if q.strip() else md.get("title",""))
            res = index.query(vector=qvec, top_k=top_k+1, include_metadata=True, namespace="default")
        else:
            raise HTTPException(status_code=400, detail="Use POST /api/similar/image for image probes.")
        matches = res.get("matches", [])
        matches = [m for m in matches if m["id"] != uniq_id]
        items = [SearchHit(id=m["id"], score=float(m.get("score",0.0)), metadata=m.get("metadata",{}))
                 for m in matches[:top_k]]
        return SimilarResponse(items=items)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("similar_by_id failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/similar/image", response_model=SimilarResponse)
def similar_by_image(body: ImageQuery, top_k: int = Query(12, ge=1, le=100)):
    try:
        if image_index is None:
            raise HTTPException(status_code=400, detail="Image index not available.")
        raw = base64.b64decode(body.image_b64)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        qvec = encode_image(img)
        res = image_index.query(vector=qvec, top_k=top_k, include_metadata=True, namespace="default")
        items = [SearchHit(id=m["id"], score=float(m.get("score",0.0)), metadata=m.get("metadata",{}))
                 for m in res.get("matches", [])]
        return SimilarResponse(items=items)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("similar_by_image failed")
        raise HTTPException(status_code=500, detail=str(e))
