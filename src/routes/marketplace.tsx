import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { GlassCard } from "@/components/glass-card";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { ADMIN_EMAIL, ADMIN_WHATSAPP } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Store,
  Plus,
  MessageCircle,
  Trash2,
  Loader2,
  ImagePlus,
  X,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/marketplace")({
  component: () => (
    <AppLayout>
      <Marketplace />
    </AppLayout>
  ),
});

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price_dzd: number;
  condition: string;
  category: string;
  image_url: string | null;
  created_at: string;
  seller_id: string | null;
};

const CATEGORIES = [
  "all",
  "scrubs",
  "stethoscopes",
  "tourniquets",
  "gloves",
  "bags",
  "books",
  "equipment",
  "other",
] as const;

const CATEGORY_LABELS: Record<string, { en: string; ar: string; fr: string }> = {
  all: { en: "All", ar: "الكل", fr: "Tout" },
  scrubs: { en: "Scrubs", ar: "ملابس طبية", fr: "Tenues" },
  stethoscopes: { en: "Stethoscopes", ar: "سماعات", fr: "Stéthoscopes" },
  tourniquets: { en: "Tourniquets", ar: "عاصبات", fr: "Garrots" },
  gloves: { en: "Gloves & PPE", ar: "قفازات وحماية", fr: "Gants & EPI" },
  bags: { en: "Bags", ar: "حقائب", fr: "Sacs" },
  books: { en: "Books", ar: "كتب", fr: "Livres" },
  equipment: { en: "Equipment", ar: "معدات", fr: "Équipement" },
  other: { en: "Other", ar: "أخرى", fr: "Autre" },
};

function Marketplace() {
  const { state, t } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const qc = useQueryClient();
  const lang = state.language;
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "asc" | "desc">("new");
  const [adding, setAdding] = useState(false);

  const listings = useQuery({
    queryKey: ["marketplace", "list"],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      toast.success(t("mkDeleted"));
    },
    onError: () => toast.error(t("mkDeleteError")),
  });

  const filtered = useMemo(() => {
    const list = (listings.data ?? []).filter(
      (l) => category === "all" || l.category === category,
    );
    if (sort === "asc") return [...list].sort((a, b) => a.price_dzd - b.price_dzd);
    if (sort === "desc") return [...list].sort((a, b) => b.price_dzd - a.price_dzd);
    return list;
  }, [listings.data, category, sort]);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5 pb-8 relative z-10">
      <header className="flex items-start gap-3">
        <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white grid place-items-center glow">
          <Store className="size-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("mkEyebrow")}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gradient">
            {t("marketplace")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("mkSubtitle")}</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setAdding(true)}
            size="icon"
            className="rounded-2xl h-12 w-12 glow shrink-0"
            aria-label={t("mkAdd")}
          >
            <Plus className="size-5" />
          </Button>
        )}
      </header>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-8 px-3 rounded-full text-[11px] font-medium border transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-primary glow"
                  : "bg-secondary/40 text-muted-foreground border-border/40",
              )}
            >
              {CATEGORY_LABELS[c]?.[lang as "en" | "ar" | "fr"] ?? c}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} {t("mkItems")}</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="bg-secondary/50 border border-border/40 rounded-full px-3 h-8 text-xs outline-none"
        >
          <option value="new">{t("mkSortNew")}</option>
          <option value="asc">{t("mkSortAsc")}</option>
          <option value="desc">{t("mkSortDesc")}</option>
        </select>
      </div>

      {listings.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-10">
          <Store className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">{t("mkEmpty")}</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-secondary/40 relative">
                {l.image_url ? (
                  <img
                    src={l.image_url}
                    alt={l.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <Tag className="size-8 opacity-40" />
                  </div>
                )}
                <span className="absolute top-2 start-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                  {CATEGORY_LABELS[l.category]?.[lang as "en" | "ar" | "fr"] ??
                    l.category}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(t("mkConfirmDelete"))) remove.mutate(l.id);
                    }}
                    className="absolute top-2 end-2 bg-rose-500/90 text-white rounded-full p-1.5"
                    aria-label="delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="font-semibold text-sm line-clamp-1">{l.title}</div>
                {l.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {l.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-base font-bold text-gradient">
                    {Math.round(l.price_dzd).toLocaleString(lang)}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      DZD
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/40 rounded-full px-2 py-0.5">
                    {l.condition}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
                    `${t("mkWaPrefix")} "${l.title}" (${Math.round(l.price_dzd)} DZD)`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="size-4" /> {t("mkContact")}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {adding && isAdmin && (
          <AddListingDialog
            onClose={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              qc.invalidateQueries({ queryKey: ["marketplace"] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddListingDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useApp();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [condition, setCondition] = useState("new");
  const [category, setCategory] = useState("scrubs");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || price <= 0) {
      toast.error(t("mkFillRequired"));
      return;
    }
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user?.id ?? "admin"}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("marketplace")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("marketplace").getPublicUrl(path);
        image_url = data.publicUrl;
      }
      const { error } = await supabase.from("marketplace_listings").insert({
        title: title.trim(),
        description: description.trim() || null,
        price_dzd: price,
        condition,
        category,
        image_url,
        seller_id: user?.id ?? null,
      });
      if (error) throw error;
      toast.success(t("mkAdded"));
      onSaved();
    } catch (e) {
      console.error(e);
      toast.error(t("mkAddError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 className="font-semibold">{t("mkAdd")}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">{t("mkTitle")}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 h-10 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">{t("mkDescription")}</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60 resize-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">{t("mkPrice")} (DZD)</span>
              <input
                type="number"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-1 h-10 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none focus:border-primary/60"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">{t("mkCondition")}</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none"
              >
                <option value="new">{t("mkCondNew")}</option>
                <option value="like_new">{t("mkCondLikeNew")}</option>
                <option value="good">{t("mkCondGood")}</option>
                <option value="used">{t("mkCondUsed")}</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-muted-foreground">{t("mkCategory")}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 h-10 px-3 rounded-xl bg-secondary/50 border border-border/40 text-sm outline-none"
            >
              {CATEGORIES.filter((c) => c !== "all").map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]?.en ?? c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">{t("mkImage")}</span>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex-1 h-10 rounded-xl bg-secondary/50 border border-dashed border-border/60 flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <ImagePlus className="size-4" />
                {file ? file.name : t("mkPickImage")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="text-muted-foreground p-2"
                  aria-label="remove"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </label>
          <Button onClick={submit} disabled={busy} className="w-full h-11 rounded-2xl mt-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : t("mkPublish")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
