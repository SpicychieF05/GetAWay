"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMockStore } from "@/store/mockStore";

// Dynamically import chart with SSR disabled — fixes Recharts width(-1) height(-1) warning
// because ResponsiveContainer needs real DOM dimensions which only exist client-side.
const SessionsChart = dynamic(
  () =>
    import("@/components/recruiter/SessionsChart").then(
      (m) => m.SessionsChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full mt-4 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    ),
  }
);

export default function AnalyticsPage() {
  const rooms = useMockStore((state) => state.rooms);

  // Flatten rooms into an array with createdAt timestamps for the chart
  const roomList = useMemo(
    () =>
      Object.values(rooms).map((r) => ({
        createdAt: r.createdAt,
      })),
    [rooms]
  );

  const totalRooms = roomList.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-2">
          Real-time interview trends based on your session data.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel border-white/10 bg-card/40">
          <CardHeader className="pb-2">
            <CardDescription>Total Rooms Created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalRooms}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/10 bg-card/40">
          <CardHeader className="pb-2">
            <CardDescription>Candidates Onboarded</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.values(rooms).filter((r) => r.candidate).length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/10 bg-card/40">
          <CardHeader className="pb-2">
            <CardDescription>Latest Room</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">
              {totalRooms > 0
                ? Object.values(rooms).sort(
                    (a, b) => b.createdAt - a.createdAt
                  )[0].roomId
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-panel border-white/10 bg-card/40">
        <CardHeader>
          <CardTitle>Session Volume</CardTitle>
          <CardDescription>
            Real-time interview session history from your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <SessionsChart rooms={roomList} />
        </CardContent>
      </Card>
    </div>
  );
}
