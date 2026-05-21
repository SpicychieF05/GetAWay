"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getClientDb } from "@/lib/firebase/client";
import {
  doc, collection, setDoc, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs,
} from "firebase/firestore";

export type ConnectionState =
  | "idle" | "requesting-media" | "waiting"
  | "connecting" | "connected" | "failed" | "denied";

export type Role = "interviewer" | "candidate";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    // Free TURN server for fallback (handles symmetric NAT)
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
};

export function useWebRTC(roomId: string, role: Role) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubRef = useRef<Array<() => void>>([]);
  // Track which ICE candidate docs we've already processed to avoid double-adding
  const processedCandidates = useRef<Set<string>>(new Set());

  const getSignalRef = () => doc(getClientDb(), "rooms", roomId, "rtc", "signal");
  const getCallerRef = () => collection(getClientDb(), "rooms", roomId, "rtcCaller");
  const getCalleeRef = () => collection(getClientDb(), "rooms", roomId, "rtcCallee");

  /** Clean up all Firestore signal data for this room (called by interviewer on leave) */
  const cleanupSignal = useCallback(async () => {
    try {
      const db = getClientDb();
      const signalRef = doc(db, "rooms", roomId, "rtc", "signal");
      const callerRef = collection(db, "rooms", roomId, "rtcCaller");
      const calleeRef = collection(db, "rooms", roomId, "rtcCallee");
      const [callerSnap, calleeSnap] = await Promise.all([getDocs(callerRef), getDocs(calleeRef)]);
      const deletes: Promise<void>[] = [];
      callerSnap.forEach((d) => deletes.push(deleteDoc(d.ref)));
      calleeSnap.forEach((d) => deletes.push(deleteDoc(d.ref)));
      deletes.push(deleteDoc(signalRef));
      await Promise.all(deletes);
    } catch {
      // best-effort
    }
  }, [roomId]);

  const hangup = useCallback(() => {
    unsubRef.current.forEach((fn) => fn());
    unsubRef.current = [];
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    processedCandidates.current.clear();
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((p) => !p);
  }, []);

  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((p) => !p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Buffer ICE candidates that arrive before remote description is set
    const pendingCandidates: RTCIceCandidateInit[] = [];

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
          setConnectionState("failed");
          return;
        }

        setConnectionState("requesting-media");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Create a new peer connection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add all local tracks to the peer connection BEFORE creating offer/answer
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        /**
         * Flush buffered ICE candidates that arrived before remote description was set.
         * Must be called after setRemoteDescription resolves.
         */
        const flushPendingCandidates = async () => {
          while (pendingCandidates.length) {
            const candidate = pendingCandidates.shift();
            if (candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch {
                // ignore stale candidates
              }
            }
          }
        };

        /**
         * Safely add an ICE candidate — buffer it if remote description is not yet set.
         */
        const addIceCandidateSafely = async (candidateData: RTCIceCandidateInit, docId: string) => {
          // Deduplicate: Firestore onSnapshot can replay old "added" changes
          if (processedCandidates.current.has(docId)) return;
          processedCandidates.current.add(docId);

          if (pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } catch {
              // ignore stale candidates
            }
          } else {
            pendingCandidates.push(candidateData);
          }
        };

        /**
         * ontrack: called when the remote peer's tracks arrive.
         * We create a new MediaStream from these tracks and update React state,
         * which triggers the VideoElement to re-render with live video.
         */
        pc.ontrack = (e) => {
          // Build a new MediaStream so React detects the reference change
          const newRemote = new MediaStream();
          if (e.streams && e.streams[0]) {
            e.streams[0].getTracks().forEach((t) => newRemote.addTrack(t));
          } else {
            newRemote.addTrack(e.track);
          }
          setRemoteStream(newRemote);
        };

        /**
         * Watch both ICE connection state AND connection state for maximum
         * browser compatibility (Safari uses iceConnectionState).
         */
        pc.oniceconnectionstatechange = () => {
          const s = pc.iceConnectionState;
          if (s === "connected" || s === "completed") {
            setConnectionState("connected");
          } else if (s === "failed" || s === "disconnected" || s === "closed") {
            setConnectionState("failed");
          }
        };

        pc.onconnectionstatechange = () => {
          const s = pc.connectionState;
          if (s === "connected") setConnectionState("connected");
          if (s === "failed" || s === "disconnected") setConnectionState("failed");
        };

        const signalRef = getSignalRef();
        const callerRef = getCallerRef();
        const calleeRef = getCalleeRef();

        if (role === "interviewer") {
          setConnectionState("connecting");

          // Register ICE handler BEFORE creating offer so no candidates are lost
          pc.onicecandidate = async (e) => {
            if (e.candidate) {
              await addDoc(callerRef, e.candidate.toJSON());
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // Write offer to Firestore (overwrite any stale data from a previous session)
          await setDoc(signalRef, {
            offer: { sdp: offer.sdp, type: offer.type },
            answer: null,
          });

          // Listen for the candidate's answer
          const unsubAnswer = onSnapshot(signalRef, async (snap) => {
            const data = snap.data();
            if (!pc.remoteDescription && data?.answer) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                await flushPendingCandidates();
              } catch {
                // already set
              }
            }
          });

          // Listen for callee (candidate) ICE candidates
          const unsubCallee = onSnapshot(calleeRef, (snap) => {
            snap.docChanges().forEach(async (ch) => {
              if (ch.type === "added") {
                await addIceCandidateSafely(ch.doc.data() as RTCIceCandidateInit, ch.doc.id);
              }
            });
          });

          unsubRef.current.push(unsubAnswer, unsubCallee);

        } else {
          // ── CANDIDATE SIDE ──────────────────────────────────────────────
          setConnectionState("waiting");

          // Register ICE handler BEFORE listening for offer
          pc.onicecandidate = async (e) => {
            if (e.candidate) {
              await addDoc(calleeRef, e.candidate.toJSON());
            }
          };

          // Listen for the interviewer's offer
          const unsubOffer = onSnapshot(signalRef, async (snap) => {
            const data = snap.data();
            // Skip if no offer, or if we already set remote description
            if (!snap.exists() || !data?.offer || pc.remoteDescription) return;

            setConnectionState("connecting");
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              // Write answer back to Firestore
              await updateDoc(signalRef, {
                answer: { sdp: answer.sdp, type: answer.type },
              });
              // Now flush any ICE candidates that arrived before remote description
              await flushPendingCandidates();
            } catch {
              // already handled
            }
          });

          // Listen for caller (interviewer) ICE candidates
          const unsubCaller = onSnapshot(callerRef, (snap) => {
            snap.docChanges().forEach(async (ch) => {
              if (ch.type === "added") {
                await addIceCandidateSafely(ch.doc.data() as RTCIceCandidateInit, ch.doc.id);
              }
            });
          });

          unsubRef.current.push(unsubOffer, unsubCaller);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const name = err instanceof Error ? err.name : "";
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
