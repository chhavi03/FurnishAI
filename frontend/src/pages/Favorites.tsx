import { useFavorites } from "../context/Favorites";
import ProductCard from "../components/ProductCard";
import { useState } from "react";
import type { Meta } from "../types";

export default function Favorites() {
  const { items } = useFavorites();
  const favs = Object.values(items);
  const [idx, setIdx] = useState<number | null>(null);
  const meta = idx != null ? favs[idx]?.meta : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Favorites</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favs.map((f, i) => (
          <ProductCard key={f.id} m={f.meta as Meta} onGen={undefined} onDetails={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}
