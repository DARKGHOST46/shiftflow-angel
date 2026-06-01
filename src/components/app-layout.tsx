import { useApp } from "@/lib/app-context";
import { useAuth, getDisplayName, getAvatarUrl, signOut } from "@/lib/auth-context";
import { FloatingBottomNav } from "@/components/floating-bottom-nav";
import { HakimFab } from "@/components/hakim-fab";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAlarmScheduler } from "@/hooks/use-alarm-scheduler";
import { LogOut, Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { state, t } = useApp();
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useAlarmScheduler();

  useEffect(() => {
    if (!loading && !session && pathname !== "/login") {
      router.navigate({ to: "/login", replace: true });
    }
  }, [loading, session, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!state.onboarded || !state.anchorDate) {
    return <OnboardingScreen />;
  }

  const name = getDisplayName(user);
  const avatar = getAvatarUrl(user);

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="max-w-2xl mx-auto px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-8 w-8 rounded-full border border-border/60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                {(name[0] ?? "?").toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">
                {t("welcomeUser")}
              </p>
              <p className="text-sm font-medium truncate leading-tight">{name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="text-muted-foreground hover:text-foreground rounded-full p-2"
            aria-label={t("signOut")}
            title={t("signOut")}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <HakimFab />
      <FloatingBottomNav />
    </div>
  );
}
