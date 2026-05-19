"use client";

import { useState } from "react";
import { useMockStore } from "@/store/mockStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";

export function OnboardingStep({ roomId, onNext }: { roomId: string, onNext: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const updateCandidate = useMockStore(state => state.updateCandidate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !role) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay for saving candidate details
    setTimeout(() => {
      updateCandidate(roomId, { name, email, role });
      setIsSubmitting(false);
      onNext();
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl bg-card/60 animate-in zoom-in-95 duration-500">
      <CardHeader className="text-center pb-2">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="text-xl font-bold text-primary">S</span>
        </div>
        <CardTitle className="text-2xl">Welcome</CardTitle>
        <CardDescription>Please provide your details to begin the interview process.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Jane Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-black/20 border-white/10"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="jane@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-white/10"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role Applying For</Label>
            <Input 
              id="role" 
              placeholder="e.g. Frontend Engineer" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="bg-black/20 border-white/10"
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
