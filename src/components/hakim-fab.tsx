import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-context";

export function HakimFab() {
  const { t } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHakim = pathname.startsWith("/hakim");

  return (
    <AnimatePresence>
      {!onHakim && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.2 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Link
            to="/hakim"
            aria-label={t("hakimTitle")}
            className="relative grid place-items-center w-14 h-14 rounded-full glass-strong overflow-hidden group"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <span className="absolute inset-0 ai-core opacity-80" />
            <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
            <Sparkles className="relative z-10 size-6 text-primary-foreground drop-shadow" />
            <span className="absolute -top-1 -right-1 z-10">
              <span className="pulse-dot" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
