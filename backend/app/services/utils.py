import re
from typing import Any

def safe_float(x: Any, default: float = 0.0) -> float:
    try:
        if x is None: return float(default)
        if isinstance(x, (int, float)): return float(x)
        s = str(x).strip()
        if s == "" or s.lower() in ("nan","none"): return float(default)
        m = re.findall(r"[-+]?\d*\.?\d+", s)
        return float(m[0]) if m else float(default)
    except Exception:
        return float(default)
