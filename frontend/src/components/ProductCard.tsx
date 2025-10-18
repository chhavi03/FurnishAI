import type { Meta } from "../types";
import { useState } from "react";
import { useFavorites } from "../context/Favorites";

function pickImage(m: Meta): string | undefined {
  if (m.image_url) return m.image_url;
  const imgs = m.images;
  if (Array.isArray(imgs) && imgs.length) return imgs[0];
  if (typeof imgs === "string" && imgs.trim()) return imgs.split(",")[0].trim();
  return undefined;
}

export default function ProductCard({
  m,
  onGen,
  onDetails,
}: {
  m: Meta;
  onGen?: () => void;
  onDetails: () => void;
}) {
  const [hideImg, setHideImg] = useState(false);
  const { isFav, toggleFav } = useFavorites();

  const src = pickImage(m);
  const categories =
    Array.isArray(m.categories) ? m.categories.join(", ") : (m.categories || "").trim();

  const hasPrice = typeof m.price === "number" && m.price > 0;
  const priceText = hasPrice
    ? `₹${Math.round(m.price as number).toLocaleString()}`
    : "Contact seller for price"; // ← fallback

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="bg-slate-100 dark:bg-slate-800 aspect-[4/3] relative">
        {src && !hideImg ? (
          <img
            src={src}
            alt={m.title || "product image"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setHideImg(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            {m.predicted_category || "image"}
          </div>
        )}

        {isFav(m.uniq_id) && (
          <div className="absolute top-2 right-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
            ♥ Favorite
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {m.brand && (
          <div className="text-sm text-slate-500 dark:text-slate-400">{m.brand}</div>
        )}
        <div className="font-semibold leading-snug mt-1 line-clamp-2">{m.title}</div>

        {categories && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
            {categories}
          </div>
        )}

        <div className="mt-2 text-sm">
          <span className={hasPrice ? "font-semibold" : "text-slate-500 dark:text-slate-400"}>
            {priceText}
          </span>
        </div>

        {m.gen_description ? (
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 line-clamp-3">
            {m.gen_description}
          </p>
        ) : (
          <button
            onClick={onGen}
            className="mt-3 text-sm text-indigo-600 hover:underline self-start"
          >
            Generate description
          </button>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onDetails}
            className="px-3 py-1 rounded border dark:border-slate-700 text-sm"
          >
            Details
          </button>
          <button
            onClick={() => toggleFav(m.uniq_id, m)}
            className={`px-3 py-1 rounded text-sm ${
              isFav(m.uniq_id) ? "bg-pink-600 text-white" : "bg-indigo-600 text-white"
            }`}
          >
            {isFav(m.uniq_id) ? "Remove" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}
