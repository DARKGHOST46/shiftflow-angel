import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, Siren, BarChart3, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function FloatingBottomNav() {
  const { t } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/", icon: Home, label: t("home") },
    { to: "/calendar", icon: Calendar, label: t("calendar") },
    { to: "/evacuation", icon: Siren, label: t("evacuation") },
    { to: "/statistics", icon: BarChart3, label: t("statistics") },
    { to: "/settings", icon: Settings, label: t("settings") },
  ] as const;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.1 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl"
    >
      {items.map((it) => {
        const active = pathname === it.to;
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-full px-3 py-2 min-w-[56px] transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-full bg-primary glow"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
            )}
            <Icon className="size-5 relative z-10" />
            <span className="text-[10px] mt-0.5 relative z-10 font-medium">{it.label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
