"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebRTC } from "@/hooks/useWebRTC";
import { VideoElement } from "./VideoElement";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  AlertCircle,
  Copy,
  CheckCircle2,
  Loader2,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { useMockStore } from "@/store/mockStore";

export function InterviewerView({ roomId }: { roomId: string }) {
  const router = useRouter();
  const room = useMockStore((state) => state.rooms[roomId]);
  const {
    localStream,
    remoteStream,
    connectionState,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    hangup,
    cleanupSignal,
  } = useWebRTC(roomId, "interviewer");

  const [screenShare, setScreenShare] = useState(false);
  const [trustScore, setTrustScore] = useState(95);

  // Simulate trust score shifting
  useEffect(() => {
    const interval = setInterval(() => {
      setTrustScore((prev) =>
        Math.min(100, Math.max(0, prev + Math.floor(Math.random() * 5) - 2)),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getTrustColor = (s: number) =>
    s > 80 ? "text-primary" : s > 60 ? "text-yellow-500" : "text-destructive";

  const triggerWarning = () => {
    setTrustScore((p) => Math.max(0, p - 15));
    toast.error("Manual warning issued to candidate.");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/interview/${roomId}?view=interviewer`,
    );
    toast.success("Interviewer link copied.");
  };

  const handleLeave = async () => {
    hangup();
    await cleanupSignal();
    toast("Leaving room...");
    setTimeout(() => router.push("/recruiter/sessions"), 1000);
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full h-[calc(100vh-2rem)] max-w-7xl mx-auto glass-panel border-white/10 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
        {/* Top Bar */}
        <div className="h-16 border-b border-border/50 bg-black/40 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-semibold text-sm tracking-wider">
                INTERVIEWER MODE
              </span>
            </div>
            <div className="w-px h-6 bg-border/50" />
            <div>
              <span className="text-xs text-muted-foreground mr-2">
                Candidate:
              </span>
              <span className="text-sm font-medium">
                {room?.candidate?.name ?? "Waiting..."}
              </span>
            </div>
            {connectionState === "connected" && (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <Wifi className="w-3 h-3" /> Connected
              </span>
            )}
            {connectionState === "connecting" && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Waiting for
                candidate...
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-xs text-muted-foreground">
                Trust Score:
              </span>
              <span
                className={`text-sm font-bold ${getTrustColor(trustScore)}`}
              >
                {trustScore}%
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="gap-2 border-white/10"
            >
              <Copy className="h-3 w-3" /> Share Room
            </Button>
          </div>
        </div>

        {/* Main Video Area */}
        <div className="flex-1 bg-black/60 relative overflow-hidden">
          {/* Candidate video — show as soon as remote tracks arrive */}
          {remoteStream && remoteStream.getTracks().length > 0 ? (
            <VideoElement
              stream={remoteStream}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-primary opacity-40">
                  {room?.candidate?.name?.charAt(0) ?? "C"}
                </span>
              </div>
              <p className="text-sm">
                {connectionState === "requesting-media"
                  ? "Initialising camera..."
                  : "Waiting for candidate to join..."}
              </p>
            </div>
          )}

          {/* Self PiP — bottom-right */}
          <div className="absolute bottom-6 right-6 w-64 h-40 bg-black/90 rounded-xl border border-white/20 shadow-2xl overflow-hidden z-20">
            {localStream ? (
              <VideoElement
                stream={localStream}
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-muted-foreground opacity-40" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
              You
            </div>
          </div>

          {/* Screen share indicator */}
          {screenShare && (
            <div className="absolute top-6 right-6 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in z-20">
              <MonitorUp className="h-4 w-4" />
              <span className="text-sm font-medium">Sharing screen</span>
            </div>
          )}

          {/* Trust Actions */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            <Button
              variant="destructive"
              size="sm"
              onClick={triggerWarning}
              className="gap-2 shadow-lg"
            >
              <AlertCircle className="h-4 w-4" /> Issue Warning
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shadow-lg bg-black/60 border-white/10 hover:bg-black/80 text-primary"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Verified
            </Button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="h-20 bg-black/50 border-t border-border/50 flex items-center justify-center gap-4 shrink-0 px-6 backdrop-blur-md">
          <Button
            variant={micOn ? "secondary" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMic}
          >
            {micOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant={camOn ? "secondary" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleCam}
          >
            {camOn ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>
          <div className="w-px h-8 bg-border/50 mx-2" />
          <Button
            variant={screenShare ? "default" : "secondary"}
            size="icon"
            className={`h-12 w-12 rounded-full ${screenShare ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]" : ""}`}
            onClick={() => setScreenShare((p) => !p)}
          >
            <MonitorUp className="h-5 w-5" />
          </Button>
          <div className="w-px h-8 bg-border/50 mx-2" />
          <Button
            variant="destructive"
            className="h-12 px-6 rounded-full font-semibold gap-2"
            onClick={handleLeave}
          >
            <PhoneOff className="h-5 w-5" /> Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
}
