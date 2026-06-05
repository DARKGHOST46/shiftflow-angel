import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { RoleGuard } from "@/components/role-guard";
import { GlassCard } from "@/components/glass-card";
import { HospitalHeader } from "@/components/hospital-header";
import { Calendar, Siren, Stethoscope, Store, FlaskConical, MapPin, ChevronRight, Settings } from "lucide-react";

export const Route = createFileRoute("/nurse")({
  component: () => (
    <RoleGuard allow={["nurse"]}>
      <AppLayout>
        <NurseDashboard />
      </AppLayout>
    </RoleGuard>
  ),
});

const TILES = [
  { to: "/calendar", icon: Calendar, label: "Shift Calendar", sub: "24h rotation" },
  { to: "/evacuation", icon: Siren, label: "Evacuation", sub: "Turn rotation" },
  { to: "/fermli", icon: Stethoscope, label: "Fermli", sub: "Clinical & legal" },
  { to: "/lab-tubes", icon: FlaskConical, label: "Lab Tubes", sub: "Reference" },
  { to: "/map", icon: MapPin, label: "Hospital Map", sub: "Algeria" },
  { to: "/marketplace", icon: Store, label: "Marketplace", sub: "Medical supplies" },
  { to: "/settings", icon: Settings, label: "Settings", sub: "Preferences" },
] as const;

function NurseDashboard() {
  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-32 space-y-4 relative z-10">
      <HospitalHeader />
      <header>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Nurse workspace</div>
        <h1 className="text-2xl font-semibold text-gradient">ShiftFlow Nurse</h1>
      </header>
      <div className="grid gap-3">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="block">
            <GlassCard className="hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center glow">
                  <t.icon className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.sub}</div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
