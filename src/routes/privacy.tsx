import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock, Activity, CloudOff, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="size-10 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-bold text-lg">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ShieldCheck className="size-5" />
            <h2>Zero-PHI Commitment</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            ShiftFlow Nurse is designed as a professional workflow tool, not an Electronic Medical Record (EMR).
            <strong> We explicitly instruct users NEVER to input Protected Health Information (PHI)</strong>,
            patient names, MRNs, or sensitive clinical data into the application.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <CloudOff className="size-5" />
            <h2>Offline-First & Local Storage</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            All your rosters, shifts, settings, and quick notes are stored locally on your device using browser `localStorage` or the native desktop file system. 
            We do not maintain centralized databases of your shift patterns. ShiftFlow Nurse operates fully offline to ensure maximum reliability in low-connectivity hospital environments.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Activity className="size-5" />
            <h2>Al-Hakim AI & Voice Recognition</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The Al-Hakim Clinical Assistant relies on cloud intelligence endpoints. When you interact with Al-Hakim:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your text prompts are sent securely to our API to generate responses.</li>
              <li>Prompts are processed ephemerally and are not used to train global AI models.</li>
              <li>Voice dictation utilizes your device's native browser SpeechRecognition API, which may transmit audio to your OS vendor (e.g., Apple or Google) for transcription.</li>
            </ul>
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Lock className="size-5" />
            <h2>Future Cloud Sync (Roadmap)</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            In the future, we may offer optional cloud synchronization so you can sync shifts across devices. If enabled, this feature will employ End-to-End Encryption (E2EE), ensuring that your schedule and notes cannot be read by our servers.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <FileWarning className="size-5" />
            <h2>Optional Telemetry</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We use minimal, anonymized telemetry (crash reports, bug feedback) to improve the stability of ShiftFlow Nurse. Before submitting feedback, our interface reminds you to strip all clinical identifiers. We do not track cross-site behavior or sell analytics data.
          </p>
        </section>

        <div className="text-sm text-muted-foreground/60 pt-8 border-t border-border/50">
          Last Updated: {new Date().toLocaleDateString()} <br />
          Contact: privacy@shiftflow.online
        </div>
      </main>
    </div>
  ),
});
