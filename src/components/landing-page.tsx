import { useApp } from "@/lib/app-context";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Download, ShieldCheck, WifiOff, Clock, Activity } from "lucide-react";

export function LandingPage() {
  const { setOnboarded } = useApp();

  const handleLaunch = () => {
    setOnboarded(true);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="size-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">ShiftFlow</span>
        </div>
        <div className="hidden sm:flex gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#offline" className="hover:text-foreground transition-colors">Offline First</a>
          <a href="#download" className="hover:text-foreground transition-colors">Download</a>
        </div>
        <button
          onClick={handleLaunch}
          className="text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-full transition-colors"
        >
          Open App
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground mb-8">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Zero PHI. 100% Local Storage.</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          The tactical <span className="text-gradient">command center</span> for 24-hour nurses.
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          ShiftFlow Nurse calculates fatigue, schedules shifts, provides emergency AI triage protocols, and operates entirely offline. Designed for the 24-hour shift and 4-day rest rotation.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/25"
          >
            Launch Web App
            <ArrowRight className="size-5" />
          </button>
          
          <a
            href="https://github.com/shiftflow/shiftflow-nurse/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50 transition px-8 py-4 rounded-2xl font-bold"
          >
            <Download className="size-5" />
            Download for Windows
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-secondary/20 border-y border-border/50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Built for the frontlines.</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Clock}
              title="Smart Shift Engine"
              description="Automatically predicts upcoming 24h rotations, calculates cumulative fatigue, and estimates salary bonuses."
            />
            <FeatureCard 
              icon={WifiOff}
              title="True Offline-First"
              description="Survives hospital dead zones. Alarms, shift logic, and emergency protocols load instantly without an internet connection."
            />
            <FeatureCard 
              icon={Activity}
              title="Emergency AI"
              description="Al-Hakim Clinical Assistant provides rapid access to medication dilutions, pediatric dosing, and triage protocols."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-sm text-muted-foreground max-w-5xl mx-auto border-t border-border/50 mt-12 w-full">
        <p className="mb-2 font-semibold">ShiftFlow Nurse is a workflow assistant, not an Electronic Medical Record.</p>
        <p className="opacity-75">Do not enter patient identifiers (PHI). Not a replacement for physician judgment.</p>
        <div className="mt-6 flex justify-center gap-4 text-xs">
          <span>v{import.meta.env.VITE_APP_VERSION || "1.0.0"}</span>
          <span className="opacity-50">•</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span className="opacity-50">•</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-background rounded-3xl p-6 border border-border/50 shadow-sm">
      <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5">
        <Icon className="size-6" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
