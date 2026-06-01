import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ADMIN_EMAIL, ADMIN_WHATSAPP } from "@/lib/constants";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShoppingBag, Plus, Pencil, Trash2, MessageCircle, Loader2, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace")({
  component: () => (
    <AppLayout>
      <Marketplace />
    </AppLayout>
  ),
});

type Listing = Tables<"marketplace_listings">;

const CATEGORIES = [
  { value: "scrubs", labelKey: "mpCatScrubs" },
  { value: "tourniquets", labelKey: "mpCatTourniquets" },
  { value: "stethoscopes", labelKey: "mpCatStethoscopes" },
  { value: "gloves", labelKey: "mpCatGloves" },
  { value: "bags", labelKey: "mpCatBags" },
  { value: "books", labelKey: "mpCatBooks" },
  { value: "equipment", labelKey: "mpCatEquipment" },
  { value: "other", labelKey: "mpCatOther" },
] as const satisfies ReadonlyArray<{ value: string; labelKey: TKey }>;

type SortKey = "newest" | "price_asc" | "price_desc";

function Marketplace() {
  const { t, state } = useApp();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const listingsQ = useQuery({
    queryKey: ["marketplace_listings"],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const catLabel = (value: string) => {
    const c = CATEGORIES.find((x) => x.value === value);
    return c ? t(c.labelKey) : value;
  };

  const listings = useMemo(() => {
    let rows = listingsQ.data ?? [];
    if (category !== "all") rows = rows.filter((r) => r.category === category);
    rows = [...rows];
    if (sort === "price_asc") rows.sort((a, b) => a.price_dzd - b.price_dzd);
    else if (sort === "price_desc") rows.sort((a, b) => b.price_dzd - a.price_dzd);
    else rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return rows;
  }, [listingsQ.data, category, sort]);

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketplace_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketplace_listings"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Add / edit dialog ----
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fPrice, setFPrice] = useState("");
  const [fCondition, setFCondition] = useState("new");
  const [fCategory, setFCategory] = useState("other");
  const [fImageUrl, setFImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditing(null);
    setFTitle("");
    setFDesc("");
    setFPrice("");
    setFCondition("new");
    setFCategory("other");
    setFImageUrl(null);
    setFile(null);
    setDialogOpen(true);
  };

  const openEdit = (l: Listing) => {
    setEditing(l);
    setFTitle(l.title);
    setFDesc(l.description ?? "");
    setFPrice(String(l.price_dzd));
    setFCondition(l.condition);
    setFCategory(l.category);
    setFImageUrl(l.image_url);
    setFile(null);
    setDialogOpen(true);
  };

  const previewUrl = file ? URL.createObjectURL(file) : fImageUrl;

  const saveListing = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!fTitle.trim() || !fPrice.trim()) throw new Error(t("mpRequired"));

      let imageUrl = fImageUrl;
      if (file) {
        setUploading(true);
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("marketplace")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("marketplace").getPublicUrl(path);
        imageUrl = pub.publicUrl;
        setUploading(false);
      }

      const payload = {
        title: fTitle.trim(),
        description: fDesc.trim() || null,
        price_dzd: Math.max(0, Math.round(Number(fPrice) || 0)),
        condition: fCondition,
        category: fCategory,
        image_url: imageUrl,
      };

      if (editing) {
        const { error } = await supabase
          .from("marketplace_listings")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("marketplace_listings")
          .insert({ ...payload, seller_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace_listings"] });
      setDialogOpen(false);
    },
    onError: (e: Error) => {
      setUploading(false);
      toast.error(e.message);
    },
  });

  const contactSeller = (l: Listing) => {
    const msg = `${t("mpWhatsappMessage")} ${l.title} (${l.price_dzd} ${t("mpCurrency")})`;
    window.open(
      `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(state.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShoppingBag className="size-6 text-primary" />
          {t("marketplaceTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("marketplaceSubtitle")}</p>
      </header>

      {/* Filter bar */}
      <div className="flex gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-2xl glass border-border/40 flex-1">
            <SelectValue placeholder={t("mpCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("mpAllCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {t(c.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="rounded-2xl glass border-border/40 flex-1">
            <SelectValue placeholder={t("mpSortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("mpSortNewest")}</SelectItem>
            <SelectItem value="price_asc">{t("mpSortPriceLow")}</SelectItem>
            <SelectItem value="price_desc">{t("mpSortPriceHigh")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {listingsQ.isLoading && (
        <GlassCard className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </GlassCard>
      )}

      {!listingsQ.isLoading && listings.length === 0 && (
        <GlassCard className="text-center py-12 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">{t("mpEmpty")}</p>
        </GlassCard>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {listings.map((l) => (
            <motion.div
              key={l.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass rounded-2xl overflow-hidden border border-border/40 flex flex-col"
            >
              <div className="relative aspect-square bg-secondary/40">
                {l.image_url ? (
                  <img src={l.image_url} alt={l.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="size-8 opacity-40" />
                  </div>
                )}
                <Badge
                  variant={l.condition === "new" ? "default" : "secondary"}
                  className={cn(
                    "absolute top-2 start-2 rounded-full text-[10px]",
                    l.condition === "new" && "glow",
                  )}
                >
                  {l.condition === "new" ? t("mpConditionNew") : t("mpConditionUsed")}
                </Badge>
                {isAdmin && (
                  <div className="absolute top-2 end-2 flex gap-1">
                    <button
                      onClick={() => openEdit(l)}
                      aria-label={t("mpEdit")}
                      className="h-7 w-7 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground hover:bg-background"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t("mpDeleteConfirm"))) deleteListing.mutate(l.id);
                      }}
                      aria-label={t("mpDelete")}
                      className="h-7 w-7 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-destructive hover:bg-background"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col gap-1 flex-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {catLabel(l.category)}
                </span>
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">{l.title}</h3>
                <div className="text-base font-bold text-gradient mt-auto">
                  {l.price_dzd.toLocaleString(state.language)} {t("mpCurrency")}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {t("mpPostedOn")} {fmtDate(l.created_at)}
                </span>
                <Button
                  size="sm"
                  className="rounded-full mt-2 w-full bg-[#25D366] hover:bg-[#1faa52] text-white"
                  onClick={() => contactSeller(l)}
                >
                  <MessageCircle className="size-4" />
                  {t("mpContactSeller")}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating add button (admin only) */}
      {isAdmin && (
        <button
          onClick={openAdd}
          className="fixed bottom-24 end-5 z-40 h-14 px-5 rounded-full bg-primary text-primary-foreground glow flex items-center gap-2 font-semibold shadow-2xl"
        >
          <Plus className="size-5" />
          <span className="hidden sm:inline">{t("mpAddListing")}</span>
        </button>
      )}

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-border/40 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("mpEditListing") : t("mpAddListing")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Photo */}
            <div className="space-y-1.5">
              <Label>{t("mpPhoto")}</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full aspect-video rounded-2xl border border-dashed border-border/60 bg-secondary/30 overflow-hidden flex items-center justify-center text-muted-foreground hover:border-primary/60 transition-colors"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <ImagePlus className="size-6" />
                    {t("mpUpload")}
                  </span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("mpTitleField")}</Label>
              <Input
                value={fTitle}
                onChange={(e) => setFTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("mpDescription")}</Label>
              <Textarea
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("mpPriceField")}</Label>
                <Input
                  type="number"
                  value={fPrice}
                  onChange={(e) => setFPrice(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("mpCondition")}</Label>
                <Select value={fCondition} onValueChange={setFCondition}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("mpConditionNew")}</SelectItem>
                    <SelectItem value="used">{t("mpConditionUsed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("mpCategory")}</Label>
              <Select value={fCategory} onValueChange={setFCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setDialogOpen(false)}>
              {t("mpCancel")}
            </Button>
            <Button
              className="rounded-full glow"
              onClick={() => saveListing.mutate()}
              disabled={saveListing.isPending || uploading}
            >
              {(saveListing.isPending || uploading) && <Loader2 className="size-4 animate-spin" />}
              {uploading ? t("mpUploading") : saveListing.isPending ? t("mpSaving") : t("mpSave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
