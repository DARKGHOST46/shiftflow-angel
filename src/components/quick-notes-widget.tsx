import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { useApp } from "@/lib/app-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, StickyNote } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function QuickNotesWidget() {
  const { state, addNote, removeNote, t } = useApp();
  const [text, setText] = useState("");

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    addNote(v);
    setText("");
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="size-4 text-primary" />
        <h3 className="font-semibold tracking-tight">{t("quickNotes")}</h3>
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("addNote")}
          className="bg-background/60 backdrop-blur rounded-xl border-border"
        />
        <Button onClick={submit} size="icon" className="rounded-xl">
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {state.notes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("noNotes")}</p>
          )}
          {state.notes.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-2 rounded-xl bg-secondary/50 backdrop-blur px-3 py-2"
            >
              <p className="flex-1 text-sm leading-relaxed">{n.text}</p>
              <button
                onClick={() => removeNote(n.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="remove"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
