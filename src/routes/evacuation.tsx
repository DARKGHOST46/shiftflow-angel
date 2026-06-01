import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { useAuth, getDisplayName } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Siren,
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  MapPin,
  Loader2,
  ListPlus,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evacuation")({
  component: () => (
    <AppLayout>
      <Evacuation />
    </AppLayout>
  ),
});

type EvacList = Tables<"evacuation_lists">;
type EvacEntry = Tables<"evacuation_entries">;

// Algerian cities & major hospitals offered as suggestions for the "place" field.
const ALGERIA_PLACES = [
  "CHU Mustapha Pacha (Alger)",
  "CHU Béni Messous (Alger)",
  "EHU 1er Novembre (Oran)",
  "CHU Oran",
  "CHU Constantine",
  "CHU Annaba",
  "CHU Tlemcen",
  "CHU Blida",
  "CHU Sétif",
  "CHU Batna",
  "CHU Sidi Bel Abbès",
  "CHU Béjaïa",
  "CHU Tizi Ouzou",
  "Hôpital Aïn Témouchent",
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Tlemcen",
  "Sétif",
  "Batna",
  "Béjaïa",
  "Tizi Ouzou",
];

function Evacuation() {
  const { t, state } = useApp();
  const { user } = useAuth();
  const qc = useQueryClient();
  const displayName = getDisplayName(user);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // ---- Queries ----
  const listsQ = useQuery({
    queryKey: ["evac_lists"],
    queryFn: async (): Promise<EvacList[]> => {
      const { data, error } = await supabase
        .from("evacuation_lists")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const entriesQ = useQuery({
    queryKey: ["evac_entries", selectedListId],
    enabled: !!selectedListId,
    queryFn: async (): Promise<EvacEntry[]> => {
      const { data, error } = await supabase
        .from("evacuation_entries")
        .select("*")
        .eq("list_id", selectedListId as string)
        .order("turn_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const lists = useMemo(() => listsQ.data ?? [], [listsQ.data]);
  const entries = useMemo(() => entriesQ.data ?? [], [entriesQ.data]);

  // Keep a valid list selected.
  useEffect(() => {
    if (lists.length === 0) {
      if (selectedListId !== null) setSelectedListId(null);
      return;
    }
    if (!selectedListId || !lists.some((l) => l.id === selectedListId)) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  // ---- Realtime sync (collaborative board) ----
  useEffect(() => {
    const channel = supabase
      .channel("evacuation-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "evacuation_lists" }, () =>
        qc.invalidateQueries({ queryKey: ["evac_lists"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "evacuation_entries" }, () =>
        qc.invalidateQueries({ queryKey: ["evac_entries"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // ---- Mutations ----
  const createList = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("evacuation_lists")
        .insert({ name, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["evac_lists"] });
      setSelectedListId(data.id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evacuation_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac_lists"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const addEntry = useMutation({
    mutationFn: async (vars: { nurse_name: string; place: string; turn_order: number }) => {
      if (!user || !selectedListId) throw new Error("No list selected");
      const { error } = await supabase.from("evacuation_entries").insert({
        list_id: selectedListId,
        owner_id: user.id,
        nurse_name: vars.nurse_name,
        place: vars.place || null,
        turn_order: vars.turn_order,
        last_edited_by_name: displayName,
        last_edited_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac_entries", selectedListId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const updateEntry = useMutation({
    mutationFn: async (vars: {
      id: string;
      nurse_name?: string;
      place?: string | null;
      turn_order?: number;
    }) => {
      const { id, ...fields } = vars;
      const { error } = await supabase
        .from("evacuation_entries")
        .update({
          ...fields,
          last_edited_by_name: displayName,
          last_edited_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac_entries", selectedListId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evacuation_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["evac_entries", selectedListId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // Swap turn_order with the neighbour to reorder.
  const reorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const a = entries[index];
    const b = entries[target];
    try {
      const stamp = new Date().toISOString();
      const [r1, r2] = await Promise.all([
        supabase
          .from("evacuation_entries")
          .update({
            turn_order: b.turn_order,
            last_edited_by_name: displayName,
            last_edited_at: stamp,
          })
          .eq("id", a.id),
        supabase
          .from("evacuation_entries")
          .update({
            turn_order: a.turn_order,
            last_edited_by_name: displayName,
            last_edited_at: stamp,
          })
          .eq("id", b.id),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      qc.invalidateQueries({ queryKey: ["evac_entries", selectedListId] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  // ---- Dialog state ----
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [entryName, setEntryName] = useState("");
  const [entryPlace, setEntryPlace] = useState("");
  const [entryTurn, setEntryTurn] = useState("");

  const nextTurn = entries.length > 0 ? Math.max(...entries.map((e) => e.turn_order)) + 1 : 1;

  const openAddEntry = () => {
    setEntryName("");
    setEntryPlace("");
    setEntryTurn(String(nextTurn));
    setEntryDialogOpen(true);
  };

  const submitEntry = () => {
    if (!entryName.trim()) {
      toast.error(t("evacNurseName"));
      return;
    }
    const turn = parseInt(entryTurn, 10);
    addEntry.mutate({
      nurse_name: entryName.trim(),
      place: entryPlace.trim(),
      turn_order: Number.isFinite(turn) ? turn : nextTurn,
    });
    setEntryDialogOpen(false);
  };

  const submitList = () => {
    if (!newListName.trim()) return;
    createList.mutate(newListName.trim());
    setNewListName("");
    setListDialogOpen(false);
  };

  // ---- Inline edit ----
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlace, setEditPlace] = useState("");

  const startEdit = (e: EvacEntry) => {
    setEditingId(e.id);
    setEditName(e.nurse_name);
    setEditPlace(e.place ?? "");
  };
  const saveEdit = (id: string) => {
    if (!editName.trim()) {
      toast.error(t("evacNurseName"));
      return;
    }
    updateEntry.mutate({ id, nurse_name: editName.trim(), place: editPlace.trim() || null });
    setEditingId(null);
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString(state.language, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("evacuation")}</h1>
          <p className="text-sm text-muted-foreground">{t("evacuationQueue")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full shrink-0"
          onClick={() => setListDialogOpen(true)}
        >
          <ListPlus className="size-4" />
          {t("evacNewList")}
        </Button>
      </header>

      {/* List selector */}
      {lists.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {lists.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedListId(l.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                selectedListId === l.id
                  ? "bg-primary text-primary-foreground border-transparent glow"
                  : "bg-secondary/50 text-muted-foreground border-border/40 hover:text-foreground",
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {listsQ.isLoading && (
        <GlassCard className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-primary" />
        </GlassCard>
      )}

      {/* Empty: no lists */}
      {!listsQ.isLoading && lists.length === 0 && (
        <GlassCard className="text-center py-10 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <Siren className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">{t("evacNoLists")}</p>
          <Button className="rounded-2xl glow" onClick={() => setListDialogOpen(true)}>
            <Plus className="size-4" />
            {t("evacCreateList")}
          </Button>
        </GlassCard>
      )}

      {/* Entries */}
      {selectedListId && (
        <>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {lists.find((l) => l.id === selectedListId)?.name}
            </h3>
            <button
              onClick={() => {
                if (window.confirm(t("evacDeleteListConfirm"))) deleteList.mutate(selectedListId);
              }}
              className="text-xs text-destructive/80 hover:text-destructive inline-flex items-center gap-1"
            >
              <Trash2 className="size-3.5" />
              {t("evacDeleteList")}
            </button>
          </div>

          <Button onClick={openAddEntry} className="w-full rounded-2xl glow h-12 text-base">
            <Plus className="size-5" />
            {t("evacAddEntry")}
          </Button>

          <p className="text-xs text-muted-foreground px-1">{t("reorderHelp")}</p>

          <div className="space-y-2">
            {entriesQ.isLoading && (
              <GlassCard className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-primary" />
              </GlassCard>
            )}

            {!entriesQ.isLoading && entries.length === 0 && (
              <GlassCard>
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("evacNoEntries")}
                </p>
              </GlassCard>
            )}

            <AnimatePresence initial={false}>
              {entries.map((e, i) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="glass rounded-2xl p-3"
                >
                  {editingId === e.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editName}
                        onChange={(ev) => setEditName(ev.target.value)}
                        placeholder={t("evacNurseName")}
                        className="rounded-xl"
                      />
                      <Input
                        list="algeria-places"
                        value={editPlace}
                        onChange={(ev) => setEditPlace(ev.target.value)}
                        placeholder={t("evacPlace")}
                        className="rounded-xl"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="size-4" />
                          {t("evacCancel")}
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full glow"
                          onClick={() => saveEdit(e.id)}
                        >
                          <Check className="size-4" />
                          {t("evacSave")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                        {e.turn_order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.nurse_name}</p>
                        {e.place && (
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <MapPin className="size-3 shrink-0" />
                            {e.place}
                          </p>
                        )}
                        {e.last_edited_by_name && (
                          <p className="text-[10px] text-muted-foreground/80 truncate flex items-center gap-1 mt-0.5">
                            <Clock className="size-2.5 shrink-0" />
                            {t("evacEditedBy")} {e.last_edited_by_name} ·{" "}
                            {fmtTime(e.last_edited_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={t("moveUp")}
                          disabled={i === 0}
                          onClick={() => reorder(i, -1)}
                          className="rounded-full h-8 w-8"
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={t("moveDown")}
                          disabled={i === entries.length - 1}
                          onClick={() => reorder(i, 1)}
                          className="rounded-full h-8 w-8"
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={t("evacEditEntry")}
                          onClick={() => startEdit(e)}
                          className="rounded-full h-8 w-8"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={t("evacDelete")}
                          onClick={() => {
                            if (window.confirm(t("evacDeleteEntryConfirm")))
                              deleteEntry.mutate(e.id);
                          }}
                          className="rounded-full h-8 w-8 text-destructive/80 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <datalist id="algeria-places">
        {ALGERIA_PLACES.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      {/* New list dialog */}
      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="glass-strong border-border/40">
          <DialogHeader>
            <DialogTitle>{t("evacCreateList")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("evacListName")}</Label>
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={t("evacListNamePlaceholder")}
              className="rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && submitList()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setListDialogOpen(false)}
            >
              {t("evacCancel")}
            </Button>
            <Button
              className="rounded-full glow"
              onClick={submitList}
              disabled={createList.isPending}
            >
              {createList.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("evacCreate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add entry dialog */}
      <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
        <DialogContent className="glass-strong border-border/40">
          <DialogHeader>
            <DialogTitle>{t("evacAddEntry")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("evacNurseName")}</Label>
              <Input
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("evacTurnNumber")}</Label>
              <Input
                type="number"
                value={entryTurn}
                onChange={(e) => setEntryTurn(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("evacPlace")}</Label>
              <Input
                list="algeria-places"
                value={entryPlace}
                onChange={(e) => setEntryPlace(e.target.value)}
                placeholder={t("evacPlaceHint")}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => setEntryDialogOpen(false)}
            >
              {t("evacCancel")}
            </Button>
            <Button
              className="rounded-full glow"
              onClick={submitEntry}
              disabled={addEntry.isPending}
            >
              {addEntry.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("evacSave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
