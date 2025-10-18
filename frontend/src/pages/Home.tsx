import { BRAND } from "../config/brand";
import { SectionTitle, SubTitle } from "../components/ui";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-8">
      <SectionTitle>{BRAND.name} Recommender</SectionTitle>
      <SubTitle>{BRAND.tagline}</SubTitle>

      <div className="mx-auto max-w-3xl text-center text-slate-600 dark:text-slate-300">
        Discover elegant furniture powered by AI. Get personalized recommendations that match your style and budget.
      </div>

      <div className="flex justify-center gap-3">
        <Link to="/recommend" className="px-5 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
          Start Exploring
        </Link>
        <Link to="/analytics" className="px-5 py-2 rounded-full border dark:border-slate-700">
          View Analytics
        </Link>
      </div>
    </div>
  );
}
