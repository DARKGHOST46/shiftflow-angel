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
import { SYSTEM_LIST } from "@/lib/shift-systems";
import { isNativeNotificationsSupported, triggerTestAlarm } from "@/lib/native-notifications";
import {
  Moon,
  Sun,
  Languages,
  CalendarCheck,
  Bell,
  Info,
  AlarmClock,
  Layers,
  Banknote,
  ShieldCheck,
  MonitorSmartphone,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getNextAlarm } from "@/lib/alarm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppLayout>
      <Settings />
    </AppLayout>
  ),
});

function Settings() {
  const {
    state,
    setTheme,
    setLanguage,
    setAnchorDate,
    setSystemId,
    setNotifications,
    setAlarmEnabled,
    setAlarmTime,
    setAlarmLeadMinutes,
    setHourlyRate,
    setNightBonusPct,
    t,
  } = useApp();
  const anchor = parseAnchorDate(state.anchorDate);
  const nextAlarm = state.alarmEnabled
    ? getNextAlarm(anchor, state.alarmTime, state.systemId, state.alarmLeadMinutes)
    : null;

  const [permStatus, setPermStatus] = useState<string>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermStatus(Notification.permission);
    }
  }, []);

  const toggleNotifications = async (v: boolean) => {
    if (v && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setPermStatus(perm);
      if (perm !== "granted") {
        toast.error("Permission denied");
        return;
      }
      new Notification("ShiftFlow Nurse", { body: t("enableNotifications") });
    }
    setNotifications(v);
  };

  const handleTestAlarm = async () => {
    const success = await triggerTestAlarm(t("appName"), t("shiftAlarm") + " (Test)");
    if (success) {
      toast.success("Test alarm triggered");
      // Fallback beep play if window is in focus
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          osc.start();
          osc.stop(ctx.currentTime + 1.3);
        }
      } catch {}
    } else {
      toast.error("Failed to trigger test alarm. Check permissions.");
    }
  };

  const isDesktop = isNativeNotificationsSupported();

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5 pb-24">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings")}</h1>
      </header>

      <GlassCard>
        <Row icon={Layers} label={t("shiftSystem")}>
          <span className="text-sm font-semibold text-gradient">
            {t(SYSTEM_LIST.find((s) => s.id === state.systemId)?.nameKey ?? "sys24h")}
          </span>
        </Row>
        <div className="mt-3 space-y-2">
          {SYSTEM_LIST.map((s) => (
            <button
              key={s.id}
              onClick={() => setSystemId(s.id)}
              className={cn(
                "w-full text-left rounded-2xl px-4 py-3 transition-all",
                state.systemId === s.id
                  ? "bg-primary text-primary-foreground glow"
                  : "bg-secondary/50 hover:bg-secondary",
              )}
            >
              <div className="font-semibold">{t(s.nameKey)}</div>
              <div className="text-xs opacity-80 mt-0.5">{t(s.descKey)}</div>
            </button>
          ))}
        </div>
      </GlassCard>

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
                  state.language === l.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
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
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-semibold tracking-tight">Alarm Reliability</h2>
          </div>
          
          <Row icon={Bell} label="Notifications Allowed">
            <Switch checked={state.notifications} onCheckedChange={toggleNotifications} />
          </Row>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-secondary/30 p-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Platform</span>
              <div className="flex items-center gap-2 text-sm font-medium">
                <MonitorSmartphone className="size-4 opacity-70" />
                {isDesktop ? "Tauri Desktop" : "Web Browser"}
              </div>
            </div>
            <div className="rounded-2xl bg-secondary/30 p-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Permission</span>
              <div className="flex items-center gap-2 text-sm font-medium">
                {permStatus === "granted" ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <XCircle className="size-4 text-red-400" />
                )}
                {permStatus}
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full rounded-2xl h-12"
            onClick={handleTestAlarm}
          >
            <Bell className="size-4 mr-2" />
            Test Alarm Notification
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          <Row icon={AlarmClock} label={t("enableAlarm")}>
            <Switch
              checked={state.alarmEnabled}
              onCheckedChange={async (v) => {
                if (v && "Notification" in window && Notification.permission === "default") {
                  await Notification.requestPermission();
                }
                setAlarmEnabled(v);
              }}
            />
          </Row>
          {state.systemId === "24h_4rest" ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("alarmTime")}</span>
              <Input
                type="time"
                value={state.alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="w-32 rounded-full text-center"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("alarm")} (min)</span>
              <Input
                type="number"
                min={5}
                max={240}
                step={5}
                value={state.alarmLeadMinutes}
                onChange={(e) => setAlarmLeadMinutes(Number(e.target.value) || 0)}
                className="w-24 rounded-full text-center"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">{t("alarmHelp")}</p>
          <div className="rounded-2xl bg-secondary/40 px-4 py-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {t("nextAlarm")}
            </span>
            <span className="text-sm font-semibold text-gradient">
              {nextAlarm
                ? nextAlarm.toLocaleString(state.language, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : t("noAlarmScheduled")}
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="space-y-4">
          <Row icon={Banknote} label={t("salary")}>
            <span className="text-xs text-muted-foreground">{t("hourlyRate")}</span>
          </Row>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{t("hourlyRate")}</span>
            <Input
              type="number"
              min={0}
              value={state.hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
              className="w-28 rounded-full text-center"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{t("nightBonus")}</span>
            <Input
              type="number"
              min={0}
              max={200}
              value={state.nightBonusPct}
              onChange={(e) => setNightBonusPct(Number(e.target.value) || 0)}
              className="w-28 rounded-full text-center"
            />
          </div>
        </div>
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

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Bell;
  label: string;
  children: React.ReactNode;
}) {
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
