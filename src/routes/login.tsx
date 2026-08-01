import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//")
      ? s.next
      : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, loading } = useAuth();
  const { next } = Route.useSearch();
  const { t } = useApp();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      if (next) {
        window.location.replace(next);
        return;
      }
      navigate({ to: "/", replace: true });
    }
  }, [loading, session, navigate, next]);

  const handleGoogle = async () => {
    try {
      setSigningIn(true);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: next ? `${window.location.origin}${next}` : window.location.origin,
      });
      if (result.error) {
        toast.error(t("loginError"));
        setSigningIn(false);
        return;
      }
      // result.redirected: browser navigates away — no further action.
    } catch (e) {
      console.error(e);
      toast.error(t("loginError"));
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-[2rem] p-8 w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
            className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center glow mb-4"
          >
            <Stethoscope className="size-8" />
          </motion.div>
          <h1 className="text-3xl font-semibold tracking-tight text-gradient">
            {t("appName")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{t("loginSubtitle")}</p>

          <button
            onClick={handleGoogle}
            disabled={signingIn || loading}
            className="mt-8 w-full h-12 rounded-2xl bg-white text-gray-900 font-medium flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {signingIn ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>{signingIn ? t("loginSigningIn") : t("loginWithGoogle")}</span>
          </button>

          <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed">
            {t("loginPrivacy")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.4 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
