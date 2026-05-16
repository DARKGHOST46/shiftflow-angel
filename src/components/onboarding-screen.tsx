import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useApp } from "@/lib/app-context";
import { LANGUAGES } from "@/lib/i18n";
import { toAnchorIso } from "@/lib/storage";
import { Sparkles, Languages, CalendarCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingScreen() {
  const { t, setLanguage, setAnchorDate, setOnboarded, state } = useApp();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const steps = [
    {
      icon: Sparkles,
      title: t("welcome"),
      subtitle: t("onboardingIntro"),
    },
    {
      icon: Languages,
      title: t("onboardingLang"),
    },
    {
      icon: CalendarCheck,
      title: t("onboardingAnchor"),
      subtitle: t("anchorHelp"),
    },
  ];

  const finish = () => {
    if (date) setAnchorDate(toAnchorIso(date));
    setOnboarded(true);
  };

  const Active = steps[step];
  const Icon = Active.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="glass-strong rounded-[2rem] p-7 w-full max-w-md"
      >
        <div className="flex gap-1.5 mb-7">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="h-16 w-16 rounded-3xl flex items-center justify-center bg-primary text-primary-foreground glow mb-5">
              <Icon className="size-7" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gradient">
              {Active.title}
            </h1>
            {Active.subtitle && (
              <p className="text-muted-foreground mt-2 leading-relaxed">{Active.subtitle}</p>
            )}

            {step === 1 && (
              <div className="mt-6 space-y-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-2xl px-4 py-3 transition-all",
                      state.language === l.code
                        ? "bg-primary text-primary-foreground glow"
                        : "bg-secondary/60 hover:bg-secondary",
                    )}
                  >
                    <span className="font-medium">{l.native}</span>
                    <span className="text-xs opacity-70">{l.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 rounded-2xl bg-background/50 backdrop-blur p-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className={cn("p-3 pointer-events-auto")}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full"
          >
            <ChevronLeft className="size-4" />
            {t("back")}
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} className="rounded-full glow px-6">
              {step === 0 ? t("getStarted") : t("next")}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={!date} className="rounded-full glow px-6">
              {t("finish")}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
