import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { GlassCard } from "@/components/glass-card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LANGUAGES } from "@/lib/i18n";
import { parseAnchorDate, toAnchorIso } from "@/lib/storage";
import { Moon, Sun, Languages, CalendarCheck, Bell, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppLayout>
      <Settings />
    </AppLayout>
  ),
});

function Settings() {
  const { state, setTheme, setLanguage, setAnchorDate, setNotifications, t } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);

  const toggleNotifications = async (v: boolean) => {
    if (v && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Permission denied");
        return;
      }
      new Notification("ShiftFlow Nurse", { body: t("enableNotifications") });
    }
    setNotifications(v);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings")}</h1>
      </header>

      <GlassCard>
        <Row icon={state.theme === "dark" ? Moon : Sun} label={t("theme")}>
          <div className="flex gap-1 bg-secondary/50 rounded-full p-1">
            {(["light", "dark"] as const).map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  state.theme === th ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {t(th)}
              </button>
            ))}
          </div>
        </Row>
      </GlassCard>

      <GlassCard>
        <Row icon={Languages} label={t("language")}>
          <div className="flex gap-1 bg-secondary/50 rounded-full p-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  state.language === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </Row>
      </GlassCard>

      <GlassCard>
        <Row icon={CalendarCheck} label={t("anchorDate")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="rounded-full glass text-sm">
                {anchor ? anchor.toLocaleDateString(state.language) : "—"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={anchor ?? undefined}
                onSelect={(d) => d && setAnchorDate(toAnchorIso(d))}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </Row>
      </GlassCard>

      <GlassCard>
        <Row icon={Bell} label={t("notifications")}>
          <Switch checked={state.notifications} onCheckedChange={toggleNotifications} />
        </Row>
      </GlassCard>

      <GlassCard>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Info className="size-4" />
          </div>
          <div>
            <p className="font-semibold">{t("about")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("aboutText")}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Bell; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <Icon className="size-4" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {children}
    </div>
  );
}
