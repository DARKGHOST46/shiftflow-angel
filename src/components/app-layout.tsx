import { useApp } from "@/lib/app-context";
import { FloatingBottomNav } from "@/components/floating-bottom-nav";
import { HakimFab } from "@/components/hakim-fab";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { useAlarmScheduler } from "@/hooks/use-alarm-scheduler";

export function AppLayout({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useAlarmScheduler();

  if (!state.onboarded || !state.anchorDate) {
    return <OnboardingScreen />;
  }

  return (
    <div className="min-h-screen pb-28">
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
