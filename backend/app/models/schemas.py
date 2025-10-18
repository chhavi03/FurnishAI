from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Literal, Any

class HealthOut(BaseModel):
    name: str
    env: str
    status: str

class SearchRequest(BaseModel):
    prompt: str = Field(..., description="User query text")
    top_k: int = 12
    filters: Optional[Dict[str, Any]] = None  # Pinecone metadata filter
    use_reranker: Optional[bool] = None       # override env default

class SearchHit(BaseModel):
    id: str
    score: float
    metadata: Dict[str, Any]

class SearchResponse(BaseModel):
    items: List[SearchHit]

class SimilarResponse(BaseModel):
    items: List[SearchHit]

class Modality(BaseModel):
    modality: Literal["text","image"] = "text"
