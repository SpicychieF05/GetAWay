"use client";

import { useState } from "react";
import { OnboardingStep } from "./OnboardingStep";
import { RulesStep } from "./RulesStep";
import { LiveRoomStep } from "./LiveRoomStep";

type Step = "onboarding" | "rules" | "live";

export function CandidateFlow({ roomId }: { roomId: string }) {
  const [step, setStep] = useState<Step>("onboarding");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {step === "onboarding" && (
        <OnboardingStep roomId={roomId} onNext={() => setStep("rules")} />
      )}
      {step === "rules" && (
        <RulesStep onNext={() => setStep("live")} />
      )}
      {step === "live" && (
        <LiveRoomStep roomId={roomId} />
      )}
    </div>
  );
}
