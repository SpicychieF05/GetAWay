"use client";

import { useMockStore } from "@/store/mockStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SessionsPage() {
  const rooms = useMockStore(state => state.rooms);
  const updateSessionStatus = useMockStore(state => state.updateSessionStatus);

  const handleCompile = (roomId: string, sessionId: string) => {
    updateSessionStatus(roomId, sessionId, "running");
    
    // Simulate compilation delay
    setTimeout(() => {
      updateSessionStatus(roomId, sessionId, "done");
      toast.success("Report compiled successfully.");
    }, 2000);
  };

  const roomList = Object.values(rooms).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground mt-2">Monitor active interviews and compile post-session reports.</p>
      </div>

      {roomList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/50 rounded-xl bg-card/20">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No sessions found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Generate an interview room in the Initialize tab to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {roomList.map((room) => (
            <Card key={room.roomId} className="glass-panel border-white/10 overflow-hidden">
              <div className="flex flex-col md:flex-row border-b border-border/50">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold font-mono text-primary">{room.roomId}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {new Date(room.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <Link href={`/interview/${room.roomId}?view=interviewer`} target="_blank" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}>
                      Live Room <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {room.sessions.map(session => (
                    <div key={session.id} className="mt-6 bg-black/20 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Candidate</p>
                          <p className="font-medium text-lg">{session.candidateName || "Waiting for candidate..."}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            {/* CSS variable-based trust bar, mock 85% */}
                            <div className="h-full bg-primary" style={{ width: "85%" }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-none">
                            {session.alerts.length} Alerts
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3">
                          {session.status === 'idle' && (
                            <Button size="sm" onClick={() => handleCompile(room.roomId, session.id)} className="gap-2">
                              <Play className="h-3 w-3" /> Compile Report
                            </Button>
                          )}
                          {session.status === 'running' && (
                            <Button size="sm" disabled variant="secondary" className="gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" /> Compiling...
                            </Button>
                          )}
                          {session.status === 'done' && (
                            <Link href={`/report/${room.roomId}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-2 text-primary border-primary/30 hover:bg-primary/10")}>
                              <CheckCircle className="h-3 w-3" /> View Report
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
