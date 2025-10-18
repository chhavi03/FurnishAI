import type { Meta } from "../types";

function Row({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: string | number | null;
  fallback?: string;
}) {
  const show =
    value !== undefined &&
    value !== null &&
    !(typeof value === "string" && value.trim() === "");

  return (
    <div className="text-xs text-slate-600 dark:text-slate-300">
      <span className="font-medium">{label}: </span>
      <span>{show ? value : (fallback || "Not specified")}</span>
    </div>
  );
}

export default function ProductDetails({
  open,
  onClose,
  meta,
  onToggleFav,
  isFav,
}: {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
  onToggleFav: () => void;
  isFav: boolean;
}) {
  if (!open || !meta) return null;

  const categories = Array.isArray(meta.categories)
    ? meta.categories.join(" > ")
    : (meta.categories || "").trim();

  const hasPrice = typeof meta.price === "number" && meta.price > 0;
  const price = hasPrice
    ? `₹${Math.round(meta.price as number).toLocaleString()}`
    : "Contact seller for price"; // ← fallback here too

  const predCat = meta.predicted_category
    ? `${meta.predicted_category}${
        meta.pred_conf ? ` (${Number(meta.pred_conf).toFixed(2)})` : ""
      }`
    : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b dark:border-slate-800">
          <div className="font-semibold">Product details</div>
          <button
            className="text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-5">
          <div className="bg-slate-100 dark:bg-slate-800 aspect-[4/3] rounded-lg overflow-hidden flex items-center justify-center">
            {meta.image_url ? (
              <img
                src={meta.image_url}
                className="w-full h-full object-cover"
                alt={meta.title || "product"}
              />
            ) : (
              <div className="text-slate-400">
                {meta.predicted_category || "image"}
              </div>
            )}
          </div>

          <div>
            {meta.brand && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {meta.brand}
              </div>
            )}
            <div className="text-lg font-semibold mt-1">{meta.title}</div>
            {categories && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {categories}
              </div>
            )}
            <div className="mt-2 text-sm font-semibold">{price}</div>

            {meta.gen_description ? (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
                {meta.gen_description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No description yet. Click <span className="font-medium">Generate description</span> on the card to create one.
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={onToggleFav}
                className={`px-3 py-1 rounded text-sm ${
                  isFav ? "bg-pink-600 text-white" : "border dark:border-slate-700"
                }`}
              >
                {isFav ? "Remove from Favorites" : "Add to Favorites"}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded border dark:border-slate-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-1">
          <Row label="Material" value={meta.material} fallback="Not specified" />
          <Row label="Color" value={meta.color} fallback="Not specified" />
          <Row label="Origin" value={meta.country_of_origin} fallback="Not specified" />
          <Row label="Predicted category" value={predCat} />
          <Row label="Cluster tag" value={meta.cluster_tag} fallback="—" />
        </div>
      </div>
    </div>
  );
}
