"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import chart with SSR disabled — fixes Recharts width(-1) height(-1) warning
// because ResponsiveContainer needs real DOM dimensions which only exist client-side.
const SessionsChart = dynamic(
  () => import("@/components/recruiter/SessionsChart").then((m) => m.SessionsChart),
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
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-2">
          Platform-wide interview trends and aggregate trust scores.
        </p>
      </div>

      <Card className="glass-panel border-white/10 bg-card/40 col-span-4">
        <CardHeader>
          <CardTitle>Session Volume &amp; Quality</CardTitle>
          <CardDescription>
            Showing number of sessions over the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <SessionsChart />
        </CardContent>
      </Card>
    </div>
  );
}
