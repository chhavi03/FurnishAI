from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field, AliasChoices
from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "AI Product API"
    APP_ENV: str = "dev"
    API_V1_STR: str = "/api"

    # Accept list or comma-separated string
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = ["http://localhost:5173"]

    # Pinecone
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENV: str = "us-east-1-aws"
    PINECONE_TEXT_INDEX: str = "products-text"
    PINECONE_IMAGE_INDEX: str = "products-image"

    # Embedding models (accept legacy env names too)
    TEXT_MODEL: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        validation_alias=AliasChoices("TEXT_MODEL", "text_emb_model"),
    )
    IMAGE_MODEL: str = Field(
        default="clip-ViT-B-32",
        validation_alias=AliasChoices("IMAGE_MODEL", "image_emb_model"),
    )
    DEVICE: str = "auto"  # auto|cpu|cuda

    # Reranker flag + model (accept legacy env names)
    USE_RERANKER: bool = Field(
        default=False,
        validation_alias=AliasChoices("USE_RERANKER", "enable_rerank"),
    )
    RERANKER_MODEL: str = Field(
        default="cross-encoder/ms-marco-MiniLM-L-6-v2",
        validation_alias=AliasChoices("RERANKER_MODEL", "reranker_model"),
    )

    # Optional, ignored but tolerated so pydantic doesn’t complain if present
    NORMALIZE_EMBEDDINGS: Optional[bool] = Field(
        default=None,
        validation_alias=AliasChoices("NORMALIZE_EMBEDDINGS", "normalize_embeddings"),
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors(cls, v):
        """
        Accept either:
          - a real list (['http://a', 'http://b'])
          - a JSON-like string list ("['http://a','http://b']" or '["http://a","http://b"]')
          - a comma-separated string ("http://a,http://b")
        """
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            s = v.strip()
            # JSON-like list
            if (s.startswith("[") and s.endswith("]")) or (s.startswith("(") and s.endswith(")")):
                # very light parser: strip brackets and split by comma
                s = s[1:-1]
                parts = [p.strip().strip("'").strip('"') for p in s.split(",") if p.strip()]
                return parts
            # comma separated
            parts = [p.strip() for p in s.split(",") if p.strip()]
            return parts
        return v

settings = Settings()
