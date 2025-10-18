// src/pages/Recommend.tsx
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import { search, genDescriptionById } from "../api";
import type { SearchHit } from "../types";
import { useFavorites } from "../context/Favorites";

export default function Recommend() {
  const [items, setItems] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters] = useState<Record<string, any>>({ is_duplicate: { $eq: false } });

  const [openDetails, setOpenDetails] = useState(false);
  const [detailsIdx, setDetailsIdx] = useState<number | null>(null);
  const { isFav, toggleFav } = useFavorites();

  async function doSearch(q: string) {
    setLoading(true);
    // reset UI immediately so old descriptions/buttons don’t linger
    setItems([]);
    setOpenDetails(false);
    setDetailsIdx(null);

    try {
      // 🔑 don’t generate on the server & don’t save anything
      const res = await search(
        { prompt: q, top_k: 12, filters },
        { gen: false, save: false }
      );

      const cleaned: SearchHit[] = (res.items || []).map((it: SearchHit) => {
        const md = { ...(it.metadata || {}) };
        // 🔑 ensure every fresh search has no prefilled description
        delete (md as any).gen_description;
        return { ...it, metadata: md };
      });

      setItems(cleaned);
    } finally {
      setLoading(false);
    }
  }

  async function generateFor(id: string, i: number) {
    // 🔑 generate but DO NOT persist to DB
    const { description } = await genDescriptionById(
      id,
      "Warm, minimalist e-commerce tone. 60–90 words.",
      /* save */ false
    );

    // only patch local UI state for that card
    setItems((prev) => {
      const copy = [...prev];
      const md = { ...(copy[i].metadata || {}) };
      md.gen_description = description;
      copy[i] = { ...copy[i], metadata: md };
      return copy;
    });
  }

  const metaSelected = detailsIdx != null ? items[detailsIdx]?.metadata : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">FurnishIQ Recommendations</h1>
      <p className="text-center text-slate-600 dark:text-slate-300">
        Type what you need and explore results.
      </p>

      <SearchBar onSearch={doSearch} loading={loading} />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {items.map((it, idx) => (
          <ProductCard
            key={it.id}
            m={it.metadata}
            onGen={() => generateFor(it.id, idx)}
            onDetails={() => {
              setDetailsIdx(idx);
              setOpenDetails(true);
            }}
          />
        ))}
      </div>

      <ProductDetails
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        meta={metaSelected || null}
        onToggleFav={() => {
          if (!metaSelected) return;
          toggleFav(metaSelected.uniq_id, metaSelected);
        }}
        isFav={metaSelected ? isFav(metaSelected.uniq_id) : false}
      />
    </div>
  );
}
