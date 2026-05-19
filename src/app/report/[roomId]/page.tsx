"use client";

import { useMockStore } from "@/store/mockStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Download, AlertTriangle, Clock, User, CheckCircle2 } from "lucide-react";
import { useState, use } from "react";
import { toast } from "sonner";
import Link from "next/link";

const FALLBACK_PERSONA = {
  name: "Alex Placeholder",
  role: "Software Engineer (Fallback)"
};

const STATIC_TIMELINE = [
  { time: "00:00", event: "Candidate joined the room", type: "info" },
  { time: "00:05", event: "Identity verification successful", type: "success" },
  { time: "05:22", event: "Interviewer joined", type: "info" },
  { time: "14:10", event: "Background noise detected (Trust -5%)", type: "warning" },
  { time: "28:45", event: "Candidate looking away (Trust -10%)", type: "warning" },
  { time: "42:00", event: "Session ended normally", type: "info" }
];

export default function ReportPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const rooms = useMockStore(state => state.rooms);
  
  const room = rooms[roomId];
  const candidate = room?.candidate || FALLBACK_PERSONA;
  
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const reportData = {
        roomId,
        candidate,
        timeline: STATIC_TIMELINE,
        generatedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `getaway-report-${roomId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Report JSON exported successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Session Report</h1>
            <p className="text-muted-foreground mt-2 font-mono">{roomId}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/recruiter/sessions" className={buttonVariants({ variant: "outline" }) + " border-white/10"}>
              Back to Sessions
            </Link>
            <Button onClick={handleExport} disabled={isExporting} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              {isExporting ? <AlertTriangle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? "Compiling..." : "Export JSON"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Persona Card */}
          <Card className="glass-panel border-white/10 bg-card/40 md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Candidate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <span className="text-3xl font-bold text-primary">{candidate.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{candidate.name}</h3>
                  <p className="text-muted-foreground">{candidate.role}</p>
                </div>
                <div className="w-full pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Final Trust Score</span>
                    <span className="font-bold text-yellow-500">85%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline and Warnings */}
          <div className="space-y-6 md:col-span-2">
            <Card className="glass-panel border-white/10 bg-card/40 border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Critical Alerts (2)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                    <span><strong className="text-foreground">14:10</strong> - Background noise detected above threshold. Audio isolated and flagged for review.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0"></div>
                    <span><strong className="text-foreground">28:45</strong> - Gaze deviation. Candidate looked away from screen for &gt;10 seconds.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/10 bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Session Timeline
                </CardTitle>
                <CardDescription>Chronological event log generated by AI Proctor.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {STATIC_TIMELINE.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 text-xs font-mono text-muted-foreground shrink-0 pt-1">{item.time}</div>
                      <div className="relative flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 z-10 ${
                          item.type === 'warning' ? 'bg-destructive' : 
                          item.type === 'success' ? 'bg-primary' : 'bg-muted-foreground'
                        }`}></div>
                        {i !== STATIC_TIMELINE.length - 1 && (
                          <div className="w-px h-full bg-border absolute top-3"></div>
                        )}
                      </div>
                      <div className={`pb-4 text-sm ${item.type === 'warning' ? 'text-destructive/90 font-medium' : 'text-foreground'}`}>
                        {item.event}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
