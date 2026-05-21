"use client";

import { useRouter } from "next/navigation";
import { useWebRTC } from "@/hooks/useWebRTC";
import { VideoElement } from "./VideoElement";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle, RefreshCcw, Loader2, Wifi } from "lucide-react";
import { toast } from "sonner";

const STATE_LABELS: Record<string, string> = {
  "requesting-media": "Requesting camera & microphone...",
  "waiting": "Waiting for interviewer to connect...",
  "connecting": "Establishing secure connection...",
  "failed": "Connection failed",
  "denied": "Camera / microphone access denied",
};

export function LiveRoomStep({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { localStream, remoteStream, connectionState, micOn, camOn, toggleMic, toggleCam, hangup } =
    useWebRTC(roomId, "candidate");

  const handleEnd = () => {
    hangup();
    toast("Interview ended.");
    setTimeout(() => router.push("/thankyou"), 1000);
  };

  /* ── Loading / error states ── */
  if (connectionState === "requesting-media" || connectionState === "idle") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Connecting to Hardware...</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Please allow microphone and camera access when prompted by your browser.
          </p>
        </div>
      </div>
    );
  }

  if (connectionState === "denied") {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center p-8 glass-panel max-w-md animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            We could not access your camera or microphone. Please allow access in your browser settings and try again.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} className="w-full gap-2">
          <RefreshCcw className="w-4 h-4" /> Retry Connection
        </Button>
      </div>
    );
  }

  // Show remote stream as soon as it has tracks (don't gate on "connected" label)
  const hasRemoteVideo = remoteStream && remoteStream.getTracks().length > 0;

  /* ── Live room ── */
  return (
    <div className="w-full h-[calc(100vh-2rem)] max-w-6xl mx-auto glass-panel border-white/10 overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-500 shadow-2xl">

      {/* Top Bar */}
      <div className="h-16 border-b border-border/50 bg-black/40 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="font-semibold text-sm tracking-wider">LIVE SESSION</span>
        </div>
        <div className="flex items-center gap-3">
          {connectionState === "connected" && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <Wifi className="w-3 h-3" /> Connected
            </span>
          )}
          {(connectionState === "waiting" || connectionState === "connecting") && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              {STATE_LABELS[connectionState]}
            </span>
          )}
          <div className="font-mono text-sm text-muted-foreground bg-black/50 px-3 py-1 rounded-md border border-white/5">
            {roomId}
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 bg-black/60 relative overflow-hidden flex items-center justify-center">

        {/* Remote stream (interviewer) — show as soon as tracks arrive */}
        {hasRemoteVideo ? (
          <VideoElement
            stream={remoteStream}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground/60">
            <Loader2 className="w-10 h-10 mb-4 animate-spin opacity-40" />
            <p className="text-sm">{STATE_LABELS[connectionState] ?? "Waiting..."}</p>
          </div>
        )}

        {/* Self PiP — bottom-left */}
        <div className="absolute bottom-6 left-6 w-48 h-32 bg-black/80 rounded-xl border border-white/20 shadow-2xl overflow-hidden z-20">
          {localStream ? (
            <VideoElement stream={localStream} muted className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">You</div>
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
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          variant={camOn ? "secondary" : "destructive"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleCam}
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <div className="w-px h-8 bg-border/50 mx-2" />
        <Button
          variant="destructive"
          className="h-12 px-6 rounded-full font-semibold gap-2"
          onClick={handleEnd}
        >
          <PhoneOff className="h-5 w-5" /> End Interview
        </Button>
      </div>
    </div>
  );
}
