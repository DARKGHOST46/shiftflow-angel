import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bug, MessageSquare, Send, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { telemetry } from "@/lib/telemetry";

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [type, setType] = useState<"bug" | "feature">("bug");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await telemetry.captureFeedback(type, message);
      setMessage("");
      onClose();
      toast.success(
        type === "bug" ? "Bug report sent securely." : "Feature request received. Thank you!"
      );
    } catch (err) {
      toast.error("Failed to send feedback. Are you offline?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/20">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            Send Feedback
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl">
            <button
              type="button"
              onClick={() => setType("bug")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                type === "bug" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bug className="size-4" />
              Report Issue
            </button>
            <button
              type="button"
              onClick={() => setType("feature")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                type === "feature" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="size-4" />
              Suggest Feature
            </button>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
              <strong>Zero-PHI Policy:</strong> Please do not include any patient names, identifiers, or sensitive clinical data in your report.
            </p>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={type === "bug" ? "Describe the issue you encountered..." : "What feature would help your workflow?"}
            className="w-full h-32 bg-transparent border border-border/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            required
          />

          <Button type="submit" disabled={isSubmitting || !message.trim()} className="w-full rounded-xl gap-2 font-bold py-6">
            <Send className="size-4" />
            {isSubmitting ? "Sending securely..." : "Send Feedback"}
          </Button>

          <div className="text-center text-[10px] text-muted-foreground mt-1">
            By submitting, you agree to our <Link to="/terms" onClick={onClose} className="underline hover:text-primary">Terms</Link> and <Link to="/privacy" onClick={onClose} className="underline hover:text-primary">Privacy Policy</Link>.
          </div>
        </form>
      </div>
    </div>
  );
}
