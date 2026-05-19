"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RangeKey = "day" | "week" | "month" | "year";

interface ChartPoint {
  label: string;
  sessions: number;
}

interface SessionsChartProps {
  rooms: Array<{ createdAt: number }>;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatHour(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatWeek(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Builds an array of chart points by bucketing room creation timestamps
 * into time slots based on the selected range.
 */
function buildChartData(
  rooms: Array<{ createdAt: number }>,
  range: RangeKey
): ChartPoint[] {
  const now = new Date();
  const buckets: Map<string, number> = new Map();

  /* Pre-fill all bucket keys so the chart has a continuous timeline
     even when some slots have 0 sessions. */

  if (range === "day") {
    // 24 hourly slots for today
    const base = startOfDay(now);
    for (let h = 0; h < 24; h++) {
      const slot = new Date(base);
      slot.setHours(h);
      buckets.set(formatHour(slot), 0);
    }
    rooms.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      if (d >= base) {
        const key = formatHour(d);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    });
  } else if (range === "week") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDay(d);
      buckets.set(key, 0);
    }
    const cutoff = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    rooms.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      if (d >= cutoff) {
        const key = formatDay(d);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    });
  } else if (range === "month") {
    // Last 30 days (bucketed weekly)
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = formatWeek(d);
      buckets.set(key, 0);
    }
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    rooms.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      if (d >= cutoff) {
        // Find the nearest week bucket
        const weekIdx = Math.min(4, Math.floor((now.getTime() - d.getTime()) / (7 * 86_400_000)));
        const bucketDate = new Date(now);
        bucketDate.setDate(bucketDate.getDate() - weekIdx * 7);
        const key = formatWeek(bucketDate);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    });
  } else {
    // Year — last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = formatMonth(d);
      buckets.set(key, 0);
    }
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    rooms.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      if (d >= cutoff) {
        const key = formatMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    });
  }

  return Array.from(buckets.entries()).map(([label, sessions]) => ({
    label,
    sessions,
  }));
}

/* ── Range labels ──────────────────────────────────────────────────── */

const RANGES: { key: RangeKey; label: string; description: string }[] = [
  { key: "day", label: "Day", description: "Hourly breakdown for today" },
  { key: "week", label: "Week", description: "Last 7 days" },
  { key: "month", label: "Month", description: "Last 30 days (weekly)" },
  { key: "year", label: "Year", description: "Last 12 months" },
];

/* ── Component ─────────────────────────────────────────────────────── */

export function SessionsChart({ rooms }: SessionsChartProps) {
  const [range, setRange] = useState<RangeKey>("week");

  const data = useMemo(() => buildChartData(rooms, range), [rooms, range]);
  const activeRange = RANGES.find((r) => r.key === range)!;

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{activeRange.description}</p>
        <div className="flex gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                range === r.key
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              itemStyle={{ color: "#10B981" }}
              labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSessions)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
          <p className="text-muted-foreground text-xs mb-1">Total Sessions</p>
          <p className="text-xl font-bold text-primary">
            {data.reduce((s, d) => s + d.sessions, 0)}
          </p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
          <p className="text-muted-foreground text-xs mb-1">Peak</p>
          <p className="text-xl font-bold">
            {Math.max(...data.map((d) => d.sessions))}
          </p>
        </div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
          <p className="text-muted-foreground text-xs mb-1">Avg / Slot</p>
          <p className="text-xl font-bold">
            {data.length > 0
              ? (data.reduce((s, d) => s + d.sessions, 0) / data.length).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>
    </div>
  );
}
