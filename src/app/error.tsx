"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Caught by Next.js Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel border-destructive/20 bg-destructive/5 p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred in the application."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.href = "/"} variant="outline" className="border-white/10">
            Go Home
          </Button>
          <Button onClick={() => reset()} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <RefreshCcw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
