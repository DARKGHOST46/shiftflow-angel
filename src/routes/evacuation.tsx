import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { useAuth, getDisplayName } from "@/lib/auth-context";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import {
  Siren,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  ListPlus,
  Pencil,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evacuation")({
  component: () => (
    <AppLayout>
      <Evacuation />
    </AppLayout>
  ),
});

type EvList = {
  id: string;
  name: string;
  destination: string | null;
  owner_id: string;
};

type EvEntry = {
  id: string;
  list_id: string;
  owner_id: string;
  nurse_name: string;
  place: string | null;
  turn_order: number;
  last_edited_by_name: string | null;
  last_edited_at: string;
};

function Evacuation() {
  const { state, t } = useApp();
  const { user } = useAuth();
  const qc = useQueryClient();
  const editorName = getDisplayName(user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const lists = useQuery({
    queryKey: ["evac", "lists"],
    queryFn: async (): Promise<EvList[]> => {
      const { data, error } = await supabase
        .from("evacuation_lists")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as EvList[];
      if (rows.length > 0 && !selectedId) setSelectedId(rows[0].id);
      return rows;
    },
  });

  const currentId = selectedId ?? lists.data?.[0]?.id ?? null;

  const entries = useQuery({
    queryKey: ["evac", "entries", currentId],
    enabled: !!currentId,
    queryFn: async (): Promise<EvEntry[]> => {
      const { data, error } = await supabase
        .from("evacuation_entries")
        .select("*")
        .eq("list_id", currentId!)
        .order("turn_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EvEntry[];
    },
  });

  const createList = useMutation({
    mutationFn: async (input: { name: string; destination: string }) => {
      if (!user) throw new Error("not authed");
      const { data, error } = await supabase
        .from("evacuation_lists")
        .insert({
          name: input.name,
          destination: input.destination || null,
          owner_id: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as EvList;
    },
    onSuccess: (row) => {
      setSelectedId(row.id);
      qc.invalidateQueries({ queryKey: ["evac", "lists"] });
      toast.success(t("evacListCreated"));
    },
    onError: () => toast.error(t("evacErrorGeneric")),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("evacuation_entries").delete().eq("list_id", id);
      const { error } = await supabase.from("evacuation_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ["evac"] });
    },
  });

  const addEntry = useMutation({
    mutationFn: async (input: { nurse_name: string; place: string }) => {
      if (!user || !currentId) throw new Error("not ready");
      const maxOrder = Math.max(0, ...(entries.data ?? []).map((e) => e.turn_order));
      const { error } = await supabase.from("evacuation_entries").insert({
        list_id: currentId,
        owner_id: user.id,
        nurse_name: input.nurse_name,
        place: input.place || null,
        turn_order: maxOrder + 1,
        last_edited_by_name: editorName,
        last_edited_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac", "entries", currentId] }),
  });

  const updateEntry = useMutation({
    mutationFn: async (input: { id: string; patch: Partial<EvEntry> }) => {
      const { error } = await supabase
        .from("evacuation_entries")
        .update({
          ...input.patch,
          last_edited_by_name: editorName,
          last_edited_at: new Date().toISOString(),
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac", "entries", currentId] }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evacuation_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac", "entries", currentId] }),
  });

  const completeTurn = async () => {
    const list = entries.data ?? [];
    if (list.length < 2) return;
    const [first, ...rest] = list;
    const updates = [
      ...rest.map((e, i) => ({ id: e.id, order: i + 1 })),
      { id: first.id, order: rest.length + 1 },
    ];
    for (const u of updates) {
      await supabase
        .from("evacuation_entries")
        .update({
          turn_order: u.order,
          last_edited_by_name: editorName,
          last_edited_at: new Date().toISOString(),
        })
        .eq("id", u.id);
    }
    qc.invalidateQueries({ queryKey: ["evac", "entries", currentId] });
    toast.success(t("evacTurnDone"));
  };

  const move = async (id: string, direction: -1 | 1) => {
    const list = entries.data ?? [];
    const i = list.findIndex((e) => e.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i];
    const b = list[j];
    await Promise.all([
      updateEntry.mutateAsync({ id: a.id, patch: { turn_order: b.turn_order } }),
      updateEntry.mutateAsync({ id: b.id, patch: { turn_order: a.turn_order } }),
    ]);
  };

  const currentList = lists.data?.find((l) => l.id === currentId);
  const next = entries.data?.[0];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5 pb-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("evacuation")}</h1>
          <p className="text-sm text-muted-foreground">{t("evacPrivateNote")}</p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          size="icon"
          className="rounded-2xl h-11 w-11 glow"
          aria-label={t("evacNewList")}
        >
          <ListPlus className="size-5" />
        </Button>
      </header>

      {lists.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (lists.data ?? []).length === 0 ? (
        <GlassCard className="text-center py-10">
          <Siren className="size-10 text-primary mx-auto mb-3 opacity-70" />
          <p className="text-sm text-muted-foreground mb-4">{t("evacEmpty")}</p>
          <Button onClick={() => setCreating(true)} className="rounded-2xl">
            <Plus className="size-4" /> {t("evacCreateFirst")}
          </Button>
        </GlassCard>
      ) : (
        <>
          {/* List tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2 pb-1">
            {(lists.data ?? []).map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  "h-9 px-4 rounded-full text-xs font-medium whitespace-nowrap border shrink-0",
                  l.id === currentId
                    ? "bg-primary text-primary-foreground border-primary glow"
                    : "bg-secondary/40 text-muted-foreground border-border/40",
                )}
              >
                {l.name}
                {l.destination && (
                  <span className="opacity-70 ms-1">· {l.destination}</span>
                )}
              </button>
            ))}
          </div>

          {currentList && (
            <GlassCard className="relative overflow-hidden">
              <motion.div
                aria-hidden
                className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl"
                style={{
                  background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="relative flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center glow">
                  <Siren className="size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t("nextNurse")}
                  </p>
                  <p className="text-2xl font-semibold text-gradient truncate">
                    {next?.nurse_name ?? "—"}
                  </p>
                  {next?.place && (
                    <p className="text-xs text-muted-foreground truncate">{next.place}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteList.mutate(currentList.id)}
                  className="rounded-full text-muted-foreground"
                  aria-label="delete list"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Button
                onClick={completeTurn}
                disabled={(entries.data ?? []).length < 2}
                className="w-full mt-5 rounded-2xl glow h-12 text-base"
              >
                <CheckCircle2 className="size-5" /> {t("completeTurn")}
              </Button>
            </GlassCard>
          )}

          <AddEntryForm
            onAdd={(name, place) => addEntry.mutate({ nurse_name: name, place })}
            busy={addEntry.isPending}
          />

          <GlassCard>
            <h3 className="font-semibold mb-1">{t("upcoming")}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t("reorderHelp")}</p>
            {entries.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-4 animate-spin text-primary" />
              </div>
            ) : (entries.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("evacNoEntries")}
              </p>
            ) : (
              <div className="space-y-2">
                {(entries.data ?? []).map((e, i) => (
                  <EntryRow
                    key={e.id}
                    index={i}
                    total={(entries.data ?? []).length}
                    entry={e}
                    onMove={(dir) => move(e.id, dir)}
                    onDelete={() => deleteEntry.mutate(e.id)}
                    onRename={(name, place) =>
                      updateEntry.mutate({
                        id: e.id,
                        patch: { nurse_name: name, place: place || null },
                      })
                    }
                    lang={state.language}
                    t={t}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        </>
      )}

      <AnimatePresence>
        {creating && (
          <NewListDialog
            onClose={() => setCreating(false)}
            onCreate={(name, destination) => {
              createList.mutate({ name, destination });
              setCreating(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddEntryForm({
  onAdd,
  busy,
}: {
  onAdd: (name: string, place: string) => void;
  busy: boolean;
}) {
  const { t } = useApp();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  return (
    <GlassCard>
      <h3 className="font-semibold mb-3 text-sm">{t("evacAddNurse")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("evacNurseName")}
          className="h-10 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
        />
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder={t("evacPlaceOpt")}
          className="h-10 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
        />
      </div>
      <Button
        onClick={() => {
          if (!name.trim()) return;
          onAdd(name.trim(), place.trim());
          setName("");
          setPlace("");
        }}
        disabled={busy || !name.trim()}
        className="w-full mt-3 rounded-xl h-10"
      >
        <Plus className="size-4" /> {t("evacAdd")}
      </Button>
    </GlassCard>
  );
}

function EntryRow({
  index,
  total,
  entry,
  onMove,
  onDelete,
  onRename,
  lang,
  t,
}: {
  index: number;
  total: number;
  entry: EvEntry;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onRename: (name: string, place: string) => void;
  lang: string;
  t: (k: never) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entry.nurse_name);
  const [place, setPlace] = useState(entry.place ?? "");
  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-secondary/50 p-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 px-3 rounded-lg bg-background/60 border border-border/40 text-sm outline-none"
        />
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder={t("evacPlaceOpt" as never)}
          className="h-9 px-3 rounded-lg bg-background/60 border border-border/40 text-sm outline-none"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-9 rounded-lg"
            onClick={() => {
              onRename(name.trim(), place.trim());
              setEditing(false);
            }}
          >
            {t("save" as never)}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 rounded-lg"
            onClick={() => setEditing(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }
  return (
    <motion.div
      layout
      className="flex items-center gap-2 rounded-xl bg-secondary/50 px-2 py-2"
    >
      <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{entry.nurse_name}</div>
        {entry.place && (
          <div className="text-[10px] text-muted-foreground truncate">{entry.place}</div>
        )}
        {entry.last_edited_by_name && (
          <div className="text-[9px] text-muted-foreground/70 truncate">
            ✎ {entry.last_edited_by_name} ·{" "}
            {new Date(entry.last_edited_at).toLocaleString(lang, {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "short",
            })}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="h-8 w-8 rounded-full"
          aria-label={t("moveUp" as never)}
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="h-8 w-8 rounded-full"
          aria-label={t("moveDown" as never)}
        >
          <ChevronDown className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setEditing(true)}
          className="h-8 w-8 rounded-full"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="h-8 w-8 rounded-full text-rose-400"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function NewListDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, destination: string) => void;
}) {
  const { t } = useApp();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 className="font-semibold">{t("evacNewList")}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("evacListName")}
            className="w-full h-11 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t("evacDestinationOpt")}
            className="w-full h-11 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
          />
          <Button
            onClick={() => name.trim() && onCreate(name.trim(), destination.trim())}
            disabled={!name.trim()}
            className="w-full h-11 rounded-2xl"
          >
            {t("evacCreate")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
