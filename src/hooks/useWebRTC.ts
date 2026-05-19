"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getClientDb } from "@/lib/firebase/client";
import {
  doc, collection, setDoc, onSnapshot, addDoc, updateDoc,
} from "firebase/firestore";

export type ConnectionState =
  | "idle" | "requesting-media" | "waiting"
  | "connecting" | "connected" | "failed" | "denied";

export type Role = "interviewer" | "candidate";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
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

  // Firestore signal paths — resolved lazily inside useEffect (browser-only)
  const getSignalRef = () => doc(getClientDb(), "rooms", roomId, "rtc", "signal");
  const getCallerRef = () => collection(getClientDb(), "rooms", roomId, "rtcCaller");
  const getCalleeRef = () => collection(getClientDb(), "rooms", roomId, "rtcCallee");

  const hangup = useCallback(() => {
    unsubRef.current.forEach((fn) => fn());
    unsubRef.current = [];
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
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

    const start = async () => {
      try {
        setConnectionState("requesting-media");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        const remote = new MediaStream();
        setRemoteStream(remote);

        pc.ontrack = (e) => e.streams[0].getTracks().forEach((t) => remote.addTrack(t));
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setConnectionState("connected");
          if (["failed", "disconnected"].includes(pc.connectionState)) setConnectionState("failed");
        };

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const signalRef = getSignalRef();
        const callerRef = getCallerRef();
        const calleeRef = getCalleeRef();

        if (role === "interviewer") {
          setConnectionState("connecting");

          pc.onicecandidate = async (e) => {
            if (e.candidate) await addDoc(callerRef, e.candidate.toJSON());
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await setDoc(signalRef, {
            offer: { sdp: offer.sdp, type: offer.type },
            answer: null,
          });

          const unsubAnswer = onSnapshot(signalRef, async (snap) => {
            const data = snap.data();
            if (!pc.currentRemoteDescription && data?.answer) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
          });
          const unsubCallee = onSnapshot(calleeRef, (snap) => {
            snap.docChanges().forEach(async (ch) => {
              if (ch.type === "added") {
                await pc.addIceCandidate(new RTCIceCandidate(ch.doc.data()));
              }
            });
          });
          unsubRef.current.push(unsubAnswer, unsubCallee);

        } else {
          // candidate — wait for offer
          setConnectionState("waiting");
          pc.onicecandidate = async (e) => {
            if (e.candidate) await addDoc(calleeRef, e.candidate.toJSON());
          };

          const unsubOffer = onSnapshot(signalRef, async (snap) => {
            const data = snap.data();
            if (!data?.offer || pc.currentRemoteDescription) return;
            setConnectionState("connecting");
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(signalRef, { answer: { sdp: answer.sdp, type: answer.type } });
          });
          const unsubCaller = onSnapshot(callerRef, (snap) => {
            snap.docChanges().forEach(async (ch) => {
              if (ch.type === "added") {
                await pc.addIceCandidate(new RTCIceCandidate(ch.doc.data()));
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
    return () => { cancelled = true; hangup(); };
  }, [roomId, role]); // eslint-disable-line

  return { localStream, remoteStream, connectionState, micOn, camOn, toggleMic, toggleCam, hangup };
}
