"use client";

import { useRef, useEffect } from "react";

interface VideoElementProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}

/** Attaches a MediaStream to a <video> element via ref (srcObject can't be set as a JSX prop) */
export function VideoElement({ stream, muted = false, className = "" }: VideoElementProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}
