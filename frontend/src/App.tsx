import { Route, Routes, NavLink } from "react-router-dom";
import { Moon, Sun, Sparkles } from "lucide-react";
import Home from "./pages/Home";
import Recommend from "./pages/Recommend";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import Favorites from "./pages/Favorites"; // if you added it
import { useEffect, useState } from "react";

export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    // ⬇ make the shell a flex column so footer sits at bottom
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span>FurnishIQ</span>
          </div>
          <div className="ml-auto flex gap-6 text-sm">
            {[
              ["Home", "/"],
              ["Recommend", "/recommend"],
              ["Analytics", "/analytics"],
              ["Favorites", "/favorites"],
              ["About", "/about"],
            ].map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "px-2 py-1 rounded " +
                  (isActive
                    ? "text-indigo-600 font-medium"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")
                }
                end={to === "/"}
              >
                {label}
              </NavLink>
            ))}
            <button
              className="ml-4 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              title="Toggle theme"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ⬇ let main expand to fill the height left by the navbar */}
      <main className="mx-auto max-w-6xl px-4 py-10 flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      {/* ⬇ footer will stick to the bottom on short pages */}
      <footer className="mt-auto border-t dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} AI Furniture Recommender. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
