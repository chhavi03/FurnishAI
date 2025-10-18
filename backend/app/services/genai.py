# app/services/genai.py
from __future__ import annotations
import os, random
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

_MODEL_NAME = os.getenv("GENAI_MODEL", "google/flan-t5-base")  # or flan-t5-small
_DEVICE = 0 if (os.getenv("DEVICE","auto")=="cuda" and torch.cuda.is_available()) else -1

_tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
_model = AutoModelForSeq2SeqLM.from_pretrained(
    _MODEL_NAME, torch_dtype=torch.float32, low_cpu_mem_usage=True
)
_pipe = pipeline("text2text-generation", model=_model, tokenizer=_tokenizer, device=_DEVICE)

DEFAULT_STYLE = (
    "Friendly, concise, modern e-commerce tone. "
    "Highlight material, color, feel, and use-cases. "
    "Avoid hard claims about certifications or warranties. 70–110 words."
)

def _coerce(v):
    return "" if v is None else str(v)

def build_prompt(meta: dict, style: str | None = None) -> str:
    title = _coerce(meta.get("title"))
    brand = _coerce(meta.get("brand"))
    price = meta.get("price")
    price_str = f"₹{int(price):,}" if isinstance(price, (int,float)) and price > 0 else "—"
    cats  = meta.get("categories") or []
    cat_s = ", ".join(map(str, cats)) if isinstance(cats, list) else _coerce(cats)
    mat   = _coerce(meta.get("material"))
    color = _coerce(meta.get("color"))
    cluster_tag = _coerce(meta.get("cluster_tag"))
    pred_cat    = _coerce(meta.get("predicted_category"))
    desc = _coerce(meta.get("description"))

    style = style or DEFAULT_STYLE

    # FLAN-T5 prompt (instruction → target)
    return (
        "You are a copywriter for an e-commerce site.\n"
        "Write a short, appealing product description using the facts below.\n"
        "Do not invent specifications that aren't provided. No bullet points.\n\n"
        f"STYLE: {style}\n\n"
        "FACTS:\n"
        f"- Title: {title}\n"
        f"- Brand: {brand}\n"
        f"- Price: {price_str}\n"
        f"- Categories: {cat_s}\n"
        f"- Material: {mat}\n"
        f"- Color: {color}\n"
        f"- NLP tag: {cluster_tag}\n"
        f"- CV category: {pred_cat}\n"
        f"- Existing description (may be messy): {desc}\n\n"
        "DESCRIPTION:"
    )

def generate_description(
    meta: dict,
    style: str | None = None,
    max_new_tokens: int = 120,
    temperature: float = 0.9,
    top_p: float = 0.95,
    seed: int | None = 42,
) -> str:
    if seed is not None:
        torch.manual_seed(seed); random.seed(seed)
    prompt = build_prompt(meta, style)
    out = _pipe(
        prompt,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=temperature,
        top_p=top_p,
        num_return_sequences=1,
    )[0]["generated_text"]
    # FLAN sometimes echoes; strip leading prompt remnants
    return out.split("DESCRIPTION:")[-1].strip().replace("\n", " ").strip()
