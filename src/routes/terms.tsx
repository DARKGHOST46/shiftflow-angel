import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, AlertTriangle, Scale, Ban, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/terms")({
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
          <h1 className="font-bold text-lg">Terms of Service</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <AlertTriangle className="size-5 text-destructive" />
            <h2>Educational Assistant Disclaimer</h2>
          </div>
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive-foreground text-sm leading-relaxed">
            <strong>ShiftFlow Nurse and the Al-Hakim Assistant are clinical workflow and educational tools, NOT replacements for physician judgment.</strong><br/><br/>
            The application provides reference information (e.g., drip calculations, triage guidelines, emergency protocols). You must always verify pediatric doses, drip rates, and triage protocols against your hospital's official guidelines before clinical execution.
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Scale className="size-5" />
            <h2>Limitation of Liability</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            ShiftFlow Nurse is provided "as is" and "as available". We make no warranties regarding the absolute accuracy of the medical reference material provided by the AI assistant. In no event shall ShiftFlow Nurse, its creators, or affiliates be liable for any direct, indirect, incidental, or consequential clinical damages arising from the use or inability to use the application during emergencies.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Ban className="size-5" />
            <h2>Acceptable Use & No PHI</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            You agree to use ShiftFlow Nurse exclusively for personal workflow management and general clinical reference.
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You MUST NOT enter Protected Health Information (PHI) under HIPAA, GDPR, or applicable local laws into the application.</li>
              <li>You MUST NOT use the application to attempt to diagnose a patient.</li>
              <li>You MUST NOT reverse-engineer, overwhelm, or maliciously attack the Cloudflare infrastructure powering ShiftFlow Nurse.</li>
            </ul>
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <CheckCircle2 className="size-5" />
            <h2>Emergency-Use Limitation</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            While we have engineered the app to be highly resilient with offline-first capabilities, internet connectivity and device battery life are outside our control. Do not rely exclusively on ShiftFlow Nurse for critical path, life-saving protocols if official hospital backup materials are available.
          </p>
        </section>

        <div className="text-sm text-muted-foreground/60 pt-8 border-t border-border/50">
          Last Updated: {new Date().toLocaleDateString()} <br />
          Contact: legal@shiftflow.online
        </div>
      </main>
    </div>
  ),
});
