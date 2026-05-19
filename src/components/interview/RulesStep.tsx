"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Video, Mic, AlertCircle } from "lucide-react";

export function RulesStep({ onNext }: { onNext: () => void }) {
  const [consent, setConsent] = useState(false);

  return (
    <Card className="w-full max-w-lg glass-panel border-white/10 shadow-2xl bg-card/60 animate-in slide-in-from-right-8 duration-500">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Interview Guidelines</CardTitle>
        </div>
        <CardDescription>Please review the rules before entering the live room.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ScrollArea className="h-48 w-full rounded-md border border-white/10 bg-black/20 p-4">
          <div className="space-y-4 pr-4">
            <div className="flex gap-3">
              <Video className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Camera Required</h4>
                <p className="text-sm text-muted-foreground mt-1">Your camera must remain on and unobstructed for the duration of the interview. Ensure you are in a well-lit environment.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Mic className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Microphone Access</h4>
                <p className="text-sm text-muted-foreground mt-1">Clear audio is essential. Please use headphones if possible to prevent echo.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">AI Proctoring Active</h4>
                <p className="text-sm text-muted-foreground mt-1">This session is monitored by AI to ensure fairness. Anomalies such as background voices or looking away frequently may flag the session.</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-3 bg-secondary/30 p-4 rounded-lg border border-secondary/50">
          <Checkbox 
            id="consent" 
            checked={consent} 
            onCheckedChange={(checked) => setConsent(checked === true)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I agree to the terms and conditions
            </label>
            <p className="text-sm text-muted-foreground">
              I consent to being recorded and agree to follow all guidelines outlined above.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onNext} 
          disabled={!consent} 
          className="w-full transition-all duration-300"
          variant={consent ? "default" : "secondary"}
        >
          Enter Live Room
        </Button>
      </CardFooter>
    </Card>
  );
}
