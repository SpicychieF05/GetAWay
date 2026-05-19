"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", sessions: 4, trust: 88 },
  { name: "Tue", sessions: 7, trust: 92 },
  { name: "Wed", sessions: 3, trust: 85 },
  { name: "Thu", sessions: 12, trust: 94 },
  { name: "Fri", sessions: 9, trust: 90 },
  { name: "Sat", sessions: 2, trust: 80 },
  { name: "Sun", sessions: 1, trust: 95 },
];

export function SessionsChart() {
  return (
    <div className="h-[400px] w-full mt-4">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            tick={{ fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderColor: "#334155",
              borderRadius: "8px",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#10B981" }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSessions)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
