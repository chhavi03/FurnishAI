import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import type { Meta } from "../types";

type FavoriteItem = { id: string; meta: Meta };
type Ctx = {
  items: Record<string, FavoriteItem>;
  isFav: (id: string) => boolean;
  toggleFav: (id: string, meta: Meta) => void;
  clear: () => void;
};

const FavoritesContext = createContext<Ctx | null>(null);
const LS_KEY = "ai-furniture:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, FavoriteItem>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const api = useMemo<Ctx>(() => ({
    items,
    isFav: (id: string) => !!items[id],
    toggleFav: (id: string, meta: Meta) => {
      setItems((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = { id, meta };
        return next;
      });
    },
    clear: () => setItems({}),
  }), [items]);

  return <FavoritesContext.Provider value={api}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
