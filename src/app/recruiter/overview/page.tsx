"use client";

import { useMockStore } from "@/store/mockStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Clock } from "lucide-react";

export default function OverviewPage() {
  const rooms = useMockStore(state => state.rooms);
  const totalRooms = Object.keys(rooms).length;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome to your GetAWay workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel-hover bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Video className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground mt-1">Active and past sessions</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel-hover bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground mt-1">Invited to process</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel-hover bg-card/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42m</div>
            <p className="text-xs text-muted-foreground mt-1">Across all completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
