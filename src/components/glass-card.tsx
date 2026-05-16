import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Props = HTMLMotionProps<"div"> & {
  variant?: "default" | "strong";
};

export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { className, variant = "default", children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className={cn(
        variant === "strong" ? "glass-strong" : "glass",
        "rounded-3xl p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
