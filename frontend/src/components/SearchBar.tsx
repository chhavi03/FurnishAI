import { useState } from "react";
import { motion } from "framer-motion";

export default function SearchBar({
  onSearch,
  loading = false,
  placeholder = "Type what you need…",
}: {
  onSearch: (q: string) => void;
  loading?: boolean;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!loading) onSearch(q.trim());
  }

  return (
    <motion.form
      onSubmit={submit}
      className="w-full max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .45 }}
    >
      <div
        className="
          flex items-center gap-3 p-2 rounded-full
          bg-white border border-slate-300 shadow-sm
          dark:bg-slate-800 dark:border-slate-700
          focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500
          transition-shadow
        "
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="
            flex-1 px-4 py-2 rounded-full outline-none bg-transparent
            text-slate-900 placeholder:text-slate-400
            dark:text-slate-100 dark:placeholder:text-slate-400
          "
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="
            shrink-0 px-5 py-2 rounded-full
            bg-indigo-600 text-white font-medium
            hover:bg-indigo-700 disabled:opacity-60
          "
        >
          {loading ? "Searching…" : "Search"}
        </motion.button>
      </div>
    </motion.form>
  );
}
