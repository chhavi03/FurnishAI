import axios from "axios";
import type { SearchRequest, SearchResponse } from "./types";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export async function search(req: SearchRequest, opts?: { gen?: boolean; save?: boolean }) {
  const q = new URLSearchParams();
  if (opts?.gen) q.set("gen_descriptions", "true");
  if (opts?.save) q.set("save_generated", "true");
  const { data } = await api.post<SearchResponse>(`/search?${q.toString()}`, req);
  return data;
}

export async function genDescriptionById(uniq_id: string, style?: string, save = true) {
  const { data } = await api.post(`/gen/description`, {
    uniq_id, style, save, temperature: 0.8, max_new_tokens: 110,
  });
  return data as { description: string; saved: boolean };
}

export async function getAnalytics() {
  try {
    const { data } = await api.get(`/analytics/summary`);
    return data;
  } catch {
    return {
      totals: { products: 190, avgPrice: 46284, growthPct: 23 },
      byCategory: [
        { name: "Sofas", value: 45 },
        { name: "Tables", value: 38 },
        { name: "Chairs", value: 55 },
        { name: "Storage", value: 30 },
        { name: "Beds", value: 25 },
      ],
      avgPriceByBrand: [
        { name: "LuxeLiving", value: 75000 },
        { name: "NordicHome", value: 54000 },
        { name: "WorkSpace Pro", value: 33000 },
        { name: "UrbanLoft", value: 25000 },
        { name: "ModernSpaces", value: 45000 },
      ],
      growthSeries: [
        { month: "Jan", products: 110 },
        { month: "Feb", products: 135 },
        { month: "Mar", products: 150 },
        { month: "Apr", products: 145 },
        { month: "May", products: 170 },
        { month: "Jun", products: 175 },
      ],
    };
  }
}