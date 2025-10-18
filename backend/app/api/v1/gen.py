# app/api/v1/gen.py
from fastapi import APIRouter, HTTPException, Body, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from ...services.genai import generate_description
from ...services.vectorstore import text_index  # Pinecone text index

router = APIRouter()

class GenRequest(BaseModel):
    uniq_id: Optional[str] = Field(default=None, description="If provided, fetch metadata from Pinecone")
    meta: Optional[Dict[str, Any]] = Field(default=None, description="Inline metadata if no uniq_id")
    style: Optional[str] = None
    temperature: float = 0.9
    top_p: float = 0.95
    max_new_tokens: int = 120
    seed: Optional[int] = 42
    save: bool = False  # write to Pinecone metadata as 'gen_description'

@router.post("/gen/description")
def gen_description(req: GenRequest = Body(...)):
    meta = None
    if req.uniq_id:
        # fetch from Pinecone
        try:
            res = text_index.fetch(ids=[req.uniq_id], namespace="default")
            vecs = res.get("vectors", {})
            if req.uniq_id not in vecs:
                raise HTTPException(status_code=404, detail="uniq_id not found in index")
            meta = vecs[req.uniq_id].get("metadata", {}) or {}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"fetch failed: {e}")
    else:
        meta = req.meta or {}
        if not meta:
            raise HTTPException(status_code=422, detail="Provide uniq_id or meta")

    text = generate_description(
        meta=meta,
        style=req.style,
        max_new_tokens=req.max_new_tokens,
        temperature=req.temperature,
        top_p=req.top_p,
        seed=req.seed,
    )

    if req.save and req.uniq_id:
        try:
            text_index.update(id=req.uniq_id, set_metadata={"gen_description": text}, namespace="default")
        except Exception as e:
            # Return description even if update fails
            return {"description": text, "saved": False, "error": str(e)}

    return {"description": text, "saved": bool(req.save and req.uniq_id)}
