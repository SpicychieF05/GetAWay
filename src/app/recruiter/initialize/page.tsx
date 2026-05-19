"use client";

import { useState } from "react";
import { useMockStore } from "@/store/mockStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Link as LinkIcon, Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InitializePage() {
  const createRoom = useMockStore(state => state.createRoom);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setCurrentRoomId(null);
    
    // Simulate network latency
    setTimeout(() => {
      const newRoomId = createRoom();
      setCurrentRoomId(newRoomId);
      setIsGenerating(false);
      toast.success("Room created successfully!");
    }, 1200);
  };

  const candidateLink = currentRoomId ? `${window.location.origin}/interview/${currentRoomId}?view=candidate` : "";
  const interviewerLink = currentRoomId ? `${window.location.origin}/interview/${currentRoomId}?view=interviewer` : "";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast(`Copied ${type} link to clipboard`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Initialize Interview</h2>
        <p className="text-muted-foreground mt-2">Generate a secure room ID and shareable links for the candidate and interviewer.</p>
      </div>

      <Card className="glass-panel border-white/10 shadow-xl bg-card/40">
        <CardHeader>
          <CardTitle>Create New Workspace</CardTitle>
          <CardDescription>Generates an isolated AI-proctored room.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "Provisioning..." : "Generate Interview Room"}
          </Button>

          {currentRoomId && (
            <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 border-t border-border/50 pt-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-primary/20">
                <div>
                  <p className="text-sm text-muted-foreground">Room ID</p>
                  <p className="text-2xl font-mono font-bold text-primary">{currentRoomId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Candidate Link</h4>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-black/40 rounded-md border border-white/10 text-sm font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
                    {candidateLink}
                  </div>
                  <Button variant="secondary" size="icon" onClick={() => copyToClipboard(candidateLink, "candidate")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <a href={`mailto:?subject=Interview Invitation&body=Please join your interview here: ${candidateLink}`} className={cn(buttonVariants({ variant: "secondary", size: "icon" }))}>
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Interviewer Link</h4>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-black/40 rounded-md border border-white/10 text-sm font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
                    {interviewerLink}
                  </div>
                  <Button variant="secondary" size="icon" onClick={() => copyToClipboard(interviewerLink, "interviewer")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Link href={`/interview/${currentRoomId}?view=interviewer`} target="_blank" className={cn(buttonVariants({ variant: "secondary" }), "px-4 gap-2")}>
                    <LinkIcon className="h-4 w-4" />
                    Open
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
