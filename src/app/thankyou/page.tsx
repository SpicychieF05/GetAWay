"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Mail,
  Phone,
  Code2,
  ExternalLink,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

const APP_VERSION = "1.0.0";

const DEVELOPERS = [
  {
    name: "Chirantan Mallick",
    email: "mallickchirantan@gmail.com",
    phone: "+91 83274 38929",
    linkedin: "https://www.linkedin.com/in/chirantan-mallick",
  },
  {
    name: "Sahin Sultan",
    email: "sahinsultan095@gmail.com",
    phone: "+91 98327 62877",
    linkedin: "https://www.linkedin.com/in/sahin-sultan-917b50331/",
  },
];

// Contact info shown in the "About" section (primary dev)
const CONTACT = DEVELOPERS[0];

const LinkedInIcon = () => (
  <svg
    className="w-3.5 h-3.5 fill-current"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function ThankYouPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-2xl space-y-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* ── Success card ── */}
        <div className="glass-panel border-white/10 bg-card/40 p-10 rounded-2xl text-center space-y-6 shadow-2xl">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Thank you for using <span className="text-primary">GetAWay</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Your interview session has ended successfully. The recruiter will
              review your session and get back to you soon.
            </p>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-primary fill-primary" />
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Your recording and trust analysis are being securely processed. You
            will hear back from the interviewer at the email you provided.
          </p>
        </div>

        {/* ── About GetAWay ── */}
        <div className="glass-panel border-white/10 bg-card/40 p-8 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">About GetAWay</h2>
              <p className="text-xs text-muted-foreground">
                AI-Proctored Interview Platform · v{APP_VERSION}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            GetAWay is an AI-powered interview workspace that enables recruiters
            to conduct secure, real-time proctored interviews with trust score
            analysis, automated alerts, and post-session reporting — all in one
            place.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <p className="text-muted-foreground text-xs mb-1">Platform</p>
              <p className="font-medium">GetAWay</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <p className="text-muted-foreground text-xs mb-1">Version</p>
              <p className="font-medium font-mono">{APP_VERSION}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <p className="text-muted-foreground text-xs mb-1">Contact</p>
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-medium text-primary hover:underline flex items-center gap-1 truncate"
              >
                <Mail className="w-3 h-3 shrink-0" />
                {CONTACT.email}
              </a>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-white/5">
              <p className="text-muted-foreground text-xs mb-1">Support</p>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3 shrink-0" />
                {CONTACT.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ── Developer cards ── */}
        <div className="glass-panel border-white/10 bg-card/40 p-8 rounded-2xl shadow-xl space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Developed by
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEVELOPERS.map((dev) => (
              <div
                key={dev.email}
                className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col gap-3 hover:border-primary/20 transition-colors"
              >
                <div>
                  <h3 className="text-base font-bold">{dev.name}</h3>
                  <a
                    href={`mailto:${dev.email}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors block truncate"
                  >
                    {dev.email}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dev.phone}
                  </p>
                </div>
                <Link
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start flex items-center gap-1.5 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#0A66C2] border border-[#0A66C2]/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-[0_0_15px_rgba(10,102,194,0.2)]"
                >
                  <LinkedInIcon />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()} GetAWay · All rights reserved · Built
          with ❤️ by {DEVELOPERS.map((d) => d.name).join(" & ")}
        </p>
      </div>
    </div>
  );
}
