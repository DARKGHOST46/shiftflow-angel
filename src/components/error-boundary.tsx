import { ShieldAlert, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GlobalErrorBoundary({ error, reset }: { error: any; reset: () => void }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <div className="size-16 rounded-full bg-destructive/10 text-destructive grid place-items-center mb-6">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="text-2xl font-bold mb-2">System Error Detected</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        ShiftFlow Nurse encountered an unexpected problem. We apologize for the interruption to your clinical workflow.
      </p>
      
      {import.meta.env.DEV && (
        <div className="bg-muted p-4 rounded-xl text-left overflow-auto max-w-full mb-8 text-xs font-mono text-muted-foreground border border-border/50">
          <p className="font-bold text-destructive mb-1">{error?.message || "Unknown error"}</p>
          <pre>{error?.stack}</pre>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={reset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition px-6 py-3 rounded-xl font-medium"
        >
          <RefreshCw className="size-4" />
          Reload Module
        </button>
        <Link
          to="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition px-6 py-3 rounded-xl font-medium"
          onClick={() => {
            // Give router a tick to process link before clearing possible bad state
            setTimeout(reset, 100);
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
