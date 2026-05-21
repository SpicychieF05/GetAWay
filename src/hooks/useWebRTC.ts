"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getClientDb } from "@/lib/firebase/client";
import {
  doc,
  collection,
  setDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";

export type ConnectionState =
  | "idle"
  | "requesting-media"
  | "waiting"
  | "connecting"
  | "connected"
  | "failed"
  | "denied";

export type Role = "interviewer" | "candidate";

/* ─────────────────────────────────────────────────────────────────
   ICE configuration
   Uses multiple STUN servers + several free TURN relays so the call
   works on different networks / behind symmetric NAT.
───────────────────────────────────────────────────────────────── */
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    // Metered free TURN relay
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

/* ─────────────────────────────────────────────────────────────────
   Firestore path helpers
───────────────────────────────────────────────────────────────── */
const signalPath = (roomId: string) =>
  doc(getClientDb(), "webrtc", roomId, "signal", "data");
const callerPath = (roomId: string) =>
  collection(getClientDb(), "webrtc", roomId, "callerCandidates");
const calleePath = (roomId: string) =>
  collection(getClientDb(), "webrtc", roomId, "calleeCandidates");

/* ─────────────────────────────────────────────────────────────────
   Hook
───────────────────────────────────────────────────────────────── */
export function useWebRTC(roomId: string, role: Role) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubRef = useRef<Array<() => void>>([]);
  const processedIds = useRef<Set<string>>(new Set());

  /* ── Cleanup all Firestore signal data (called by interviewer on leave) */
  const cleanupSignal = useCallback(async () => {
    try {
      const db = getClientDb();
      const sigRef = doc(db, "webrtc", roomId, "signal", "data");
      const calRef = collection(db, "webrtc", roomId, "callerCandidates");
      const ceeRef = collection(db, "webrtc", roomId, "calleeCandidates");
      const [cs, ces] = await Promise.all([getDocs(calRef), getDocs(ceeRef)]);
      const dels: Promise<void>[] = [];
      cs.forEach((d) => dels.push(deleteDoc(d.ref)));
      ces.forEach((d) => dels.push(deleteDoc(d.ref)));
      dels.push(deleteDoc(sigRef));
      await Promise.all(dels);
    } catch {
      /* best-effort */
    }
  }, [roomId]);

  /* ── Hang up */
  const hangup = useCallback(() => {
    unsubRef.current.forEach((fn) => fn());
    unsubRef.current = [];
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    processedIds.current.clear();
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  const toggleMic = useCallback(() => {
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setMicOn((p) => !p);
  }, []);

  const toggleCam = useCallback(() => {
    localStreamRef.current
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = !t.enabled));
    setCamOn((p) => !p);
  }, []);

  /* ── Main effect */
  useEffect(() => {
    let cancelled = false;
    const pendingCandidates: RTCIceCandidateInit[] = [];

    const addIceSafely = async (
      pc: RTCPeerConnection,
      data: RTCIceCandidateInit,
      id: string
    ) => {
      if (processedIds.current.has(id)) return;
      processedIds.current.add(id);

      if (pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data));
          console.log(`[WebRTC] Added ICE candidate (${id})`);
        } catch (e) {
          console.warn("[WebRTC] addIceCandidate failed:", e);
        }
      } else {
        pendingCandidates.push(data);
        console.log(`[WebRTC] Buffered ICE candidate (${id}) – no remote desc yet`);
      }
    };

    const flushPending = async (pc: RTCPeerConnection) => {
      console.log(`[WebRTC] Flushing ${pendingCandidates.length} buffered ICE candidates`);
      while (pendingCandidates.length) {
        const c = pendingCandidates.shift()!;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {
          /* ignore stale */
        }
      }
    };

    const start = async () => {
      try {
        if (
          !navigator.mediaDevices?.getUserMedia ||
          !window.RTCPeerConnection
        ) {
          setConnectionState("failed");
          return;
        }

        /* ── 1. Acquire local media */
        setConnectionState("requesting-media");
        console.log("[WebRTC] Requesting user media...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
        console.log("[WebRTC] Got local stream");

        /* ── 2. Create peer connection */
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        /* ── 3. Add local tracks BEFORE offer/answer */
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        console.log("[WebRTC] Added local tracks to PeerConnection");

        /* ── 4. Remote track handler — creates a NEW MediaStream so React
                 detects the reference change and re-renders the video element */
        pc.ontrack = (e) => {
          console.log("[WebRTC] ontrack fired, streams:", e.streams.length, "track kind:", e.track.kind);
          // Build a brand-new MediaStream from incoming tracks so React sees the change
          const newRemote = new MediaStream();
          if (e.streams && e.streams[0]) {
            e.streams[0].getTracks().forEach((t) => newRemote.addTrack(t));
          } else {
            newRemote.addTrack(e.track);
          }
          setRemoteStream(newRemote);
        };

        /* ── 5. Connection state watchers */
        pc.onconnectionstatechange = () => {
          console.log("[WebRTC] connectionState →", pc.connectionState);
          if (pc.connectionState === "connected") setConnectionState("connected");
          if (pc.connectionState === "failed" || pc.connectionState === "disconnected")
            setConnectionState("failed");
        };
        pc.oniceconnectionstatechange = () => {
          console.log("[WebRTC] iceConnectionState →", pc.iceConnectionState);
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed")
            setConnectionState("connected");
          if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected")
            setConnectionState("failed");
        };
        pc.onicegatheringstatechange = () => {
          console.log("[WebRTC] iceGatheringState →", pc.iceGatheringState);
        };
        pc.onsignalingstatechange = () => {
          console.log("[WebRTC] signalingState →", pc.signalingState);
        };

        /* ── Firestore refs (NEW path: /webrtc/{roomId}/...) */
        const sigRef = signalPath(roomId);
        const calRef = callerPath(roomId);
        const ceeRef = calleePath(roomId);

        /* ══════════════════════════════════════════════════════════
           INTERVIEWER SIDE
        ══════════════════════════════════════════════════════════ */
        if (role === "interviewer") {
          setConnectionState("connecting");

          // Clear any stale signal data from a previous session first
          console.log("[WebRTC][Interviewer] Clearing stale signal data...");
          try {
            await cleanupSignal();
          } catch {
            /* ignore */
          }

          // Register ICE handler BEFORE createOffer so no candidates are lost
          pc.onicecandidate = async (e) => {
            if (e.candidate) {
              console.log("[WebRTC][Interviewer] Sending ICE candidate to Firestore");
              await addDoc(calRef, e.candidate.toJSON());
            }
          };

          console.log("[WebRTC][Interviewer] Creating offer...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("[WebRTC][Interviewer] Offer created, writing to Firestore...");

          await setDoc(sigRef, {
            offer: { type: offer.type, sdp: offer.sdp },
            answer: null,
            createdAt: Date.now(),
          });
          console.log("[WebRTC][Interviewer] Offer written to Firestore at webrtc/" + roomId + "/signal/data");

          // Listen for candidate's answer
          const unsubAnswer = onSnapshot(
            sigRef,
            async (snap) => {
              const data = snap.data();
              console.log("[WebRTC][Interviewer] Signal doc update — has answer:", !!data?.answer, "remote desc set:", !!pc.remoteDescription);
              if (!pc.remoteDescription && data?.answer) {
                try {
                  await pc.setRemoteDescription(
                    new RTCSessionDescription(data.answer)
                  );
                  console.log("[WebRTC][Interviewer] Remote description set (answer)");
                  await flushPending(pc);
                } catch (e) {
                  console.error("[WebRTC][Interviewer] setRemoteDescription error:", e);
                }
              }
            },
            (err) => console.error("[WebRTC][Interviewer] onSnapshot(signal) error:", err)
          );

          // Listen for callee (candidate) ICE candidates
          const unsubCallee = onSnapshot(
            ceeRef,
            (snap) => {
              snap.docChanges().forEach(async (ch) => {
                if (ch.type === "added") {
                  console.log("[WebRTC][Interviewer] Received callee ICE candidate");
                  await addIceSafely(pc, ch.doc.data() as RTCIceCandidateInit, ch.doc.id);
                }
              });
            },
            (err) => console.error("[WebRTC][Interviewer] onSnapshot(callee) error:", err)
          );

          unsubRef.current.push(unsubAnswer, unsubCallee);

        /* ══════════════════════════════════════════════════════════
           CANDIDATE SIDE
        ══════════════════════════════════════════════════════════ */
        } else {
          setConnectionState("waiting");

          // Register ICE handler BEFORE listening for offer
          pc.onicecandidate = async (e) => {
            if (e.candidate) {
              console.log("[WebRTC][Candidate] Sending ICE candidate to Firestore");
              await addDoc(ceeRef, e.candidate.toJSON());
            }
          };

          console.log("[WebRTC][Candidate] Listening for offer at webrtc/" + roomId + "/signal/data");

          // Listen for interviewer's offer
          const unsubOffer = onSnapshot(
            sigRef,
            async (snap) => {
              const data = snap.data();
              console.log("[WebRTC][Candidate] Signal doc update — exists:", snap.exists(), "has offer:", !!data?.offer, "remote desc:", !!pc.remoteDescription);

              if (!snap.exists() || !data?.offer) {
                console.log("[WebRTC][Candidate] No offer yet, waiting...");
                return;
              }
              if (pc.remoteDescription) {
                console.log("[WebRTC][Candidate] Remote desc already set, skipping");
                return;
              }

              setConnectionState("connecting");
              try {
                console.log("[WebRTC][Candidate] Setting remote description (offer)...");
                await pc.setRemoteDescription(
                  new RTCSessionDescription(data.offer)
                );
                console.log("[WebRTC][Candidate] Creating answer...");
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log("[WebRTC][Candidate] Writing answer to Firestore...");
                await updateDoc(sigRef, {
                  answer: { type: answer.type, sdp: answer.sdp },
                });
                console.log("[WebRTC][Candidate] Answer written to Firestore");
                await flushPending(pc);
              } catch (e) {
                console.error("[WebRTC][Candidate] Error in offer/answer exchange:", e);
                setConnectionState("failed");
              }
            },
            (err) => console.error("[WebRTC][Candidate] onSnapshot(signal) error:", err)
          );

          // Listen for caller (interviewer) ICE candidates
          const unsubCaller = onSnapshot(
            calRef,
            (snap) => {
              snap.docChanges().forEach(async (ch) => {
                if (ch.type === "added") {
                  console.log("[WebRTC][Candidate] Received caller ICE candidate");
                  await addIceSafely(pc, ch.doc.data() as RTCIceCandidateInit, ch.doc.id);
                }
              });
            },
            (err) => console.error("[WebRTC][Candidate] onSnapshot(caller) error:", err)
          );

          unsubRef.current.push(unsubOffer, unsubCaller);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const name = err instanceof Error ? err.name : "";
          console.error("[WebRTC] Fatal error:", err);
          setConnectionState(name === "NotAllowedError" ? "denied" : "failed");
        }
      }
    };

    start();
    return () => {
      cancelled = true;
      hangup();
    };
  }, [roomId, role]); // eslint-disable-line

  return {
    localStream,
    remoteStream,
    connectionState,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    hangup,
    cleanupSignal,
  };
}
