import { useEffect, useState } from "react";
import { getAnalytics } from "../api";
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import {
  gridStroke, axisStroke, tickStyle,
  numberFmt, priceFmt, truncate
} from "../components/chartTheme";
import { Kpi, ShellCard, SectionTitle } from "../components/ui";
import { BRAND } from "../config/brand";

type Summary = {
  totals: { products: number; avgPrice: number; growthPct: number };
  byCategory: { name: string; value: number }[];
  avgPriceByBrand: { name: string; value: number }[];
  growthSeries: { month: string; products: number }[];
};

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A78BFA", "#84CC16", "#FB7185"];

export default function Analytics() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAnalytics();
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !data) {
    return <div className="text-center text-slate-500 dark:text-slate-300">Loading analytics…</div>;
  }

  const byCat = (data.byCategory || []).slice(0, 6).map(d => ({ ...d, name: truncate(d.name, 10) }));
  const byBrand = (data.avgPriceByBrand || []).slice(0, 6).map(d => ({ ...d, name: truncate(d.name, 12) }));
  const growth = data.growthSeries || [];

  return (
    <div className="space-y-6">
      <SectionTitle>{BRAND.name} Analytics Dashboard</SectionTitle>

      <div className="grid sm:grid-cols-3 gap-4">
        <Kpi label="Total Products" value={data.totals.products.toLocaleString()} hint="+12% vs last month" delay={0} />
        <Kpi label="Avg Price" value={priceFmt(Math.round(data.totals.avgPrice || 0))} hint="Across all categories" delay={.05} />
        <Kpi label="Growth" value={`${data.totals.growthPct}%`} hint="Inventory growth rate" delay={.1} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <ShellCard title="Products by Category" delay={.1}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byCat} barCategoryGap={18} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: axisStroke }} tickLine={{ stroke: axisStroke }} interval={0} />
              <YAxis tick={tickStyle} axisLine={{ stroke: axisStroke }} tickLine={{ stroke: axisStroke }} tickFormatter={numberFmt} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, "Products"]} labelClassName="text-sm" />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </ShellCard>

        <ShellCard title="Average Price by Brand" delay={.15}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Tooltip formatter={(v: number) => [priceFmt(Math.round(v)), "Avg Price"]} />
              <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
              <Pie
                data={byBrand}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {byBrand.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ShellCard>
      </div>

      <ShellCard title="Product Growth Trend" delay={.2}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={growth} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 6" stroke={gridStroke} />
            <XAxis dataKey="month" tick={tickStyle} axisLine={{ stroke: axisStroke }} tickLine={{ stroke: axisStroke }} />
            <YAxis tick={tickStyle} axisLine={{ stroke: axisStroke }} tickLine={{ stroke: axisStroke }} tickFormatter={numberFmt} />
            <Tooltip />
            <Line type="monotone" dataKey="products" stroke="#60A5FA" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ShellCard>
    </div>
  );
}
