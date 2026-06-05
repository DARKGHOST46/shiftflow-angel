import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { GlassCard } from "@/components/glass-card";
import { useApp } from "@/lib/app-context";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, ExternalLink, Loader2, LocateFixed, Hospital, AlertTriangle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";

export const Route = createFileRoute("/map")({
  component: () => (
    <AppLayout>
      <MapPage />
    </AppLayout>
  ),
});

type DBHospital = {
  id: string; name: string; name_ar: string | null; wilaya_code: number; wilaya_name: string;
  city: string; type: string; lat: number; lng: number; phone: string | null; address: string | null;
};
type RowH = DBHospital & { _km: number };

const ALGIERS = { lat: 36.7538, lng: 3.0588 };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
const fmtDistance = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
const fmtDrive = (km: number) => `~${Math.round((km / 50) * 60)} min`;

const TYPES = ["all", "chu", "eph", "ehs", "epsp"] as const;

function makeIcon(color: string, size = 30) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4);display:grid;place-items:center"><div style="transform:rotate(45deg);color:white;font-size:14px">✚</div></div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size],
  });
}

function FitTo({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) { map.setView(points[0], 11); return; }
    map.fitBounds(points, { padding: [60, 60] });
  }, [points, map]);
  return null;
}

function MapPage() {
  const { state } = useApp();
  const isRtl = state.language === "ar";
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<DBHospital[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<(typeof TYPES)[number]>("all");
  const [loading, setLoading] = useState(true);

  const locate = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };
  useEffect(() => { locate(); }, []);

  useEffect(() => {
    supabase.from("hospitals").select("*").order("wilaya_code").then(({ data }) => {
      setHospitals((data ?? []) as DBHospital[]); setLoading(false);
    });
  }, []);

  const origin = userLoc ?? ALGIERS;
  const sorted: RowH[] = useMemo(() => {
    return hospitals
      .filter((h) => filterType === "all" || h.type === filterType)
      .map((h) => ({ ...h, _km: haversineKm(origin, h) }))
      .sort((a, b) => a._km - b._km);
  }, [hospitals, origin, filterType]);

  useEffect(() => { if (!selectedId && sorted.length) setSelectedId(sorted[0].id); }, [sorted, selectedId]);

  const selected = sorted.find((h) => h.id === selectedId);
  const fitPoints: [number, number][] = useMemo(() => {
    const pts: [number, number][] = [];
    if (userLoc) pts.push([userLoc.lat, userLoc.lng]);
    if (selected) pts.push([selected.lat, selected.lng]);
    if (pts.length === 0 && sorted[0]) pts.push([sorted[0].lat, sorted[0].lng]);
    return pts;
  }, [userLoc, selected, sorted]);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-32 space-y-4 relative z-10" dir={isRtl ? "rtl" : "ltr"}>
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="pulse-dot" /><span>{isRtl ? "خريطة المستشفيات" : "Hospital map"}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gradient">{isRtl ? "مستشفيات الجزائر" : "Algeria Hospitals"}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isRtl ? "قاعدة بيانات مستقلة · بدون خرائط جوجل" : "Independent database · No Google Maps"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={locate} className="glass shrink-0">
          <LocateFixed className="size-4 me-1.5" />{isRtl ? "موقعي" : "Locate"}
        </Button>
      </motion.header>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={cn("px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 transition",
              filterType === t ? "bg-primary text-primary-foreground glow" : "glass text-muted-foreground")}>
            {t === "all" ? (isRtl ? "الكل" : "All") : t.toUpperCase()}
          </button>
        ))}
      </div>

      {locError && (
        <GlassCard className="border-rose-500/30">
          <div className="flex gap-2 items-start text-sm">
            <AlertTriangle className="size-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-medium">{isRtl ? "تعذر تحديد موقعك" : "Could not get your location"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{isRtl ? "المسافات محسوبة من الجزائر العاصمة." : "Distances measured from Algiers."}</div>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="overflow-hidden p-0">
        <div className="relative">
          <div className="w-full h-[420px]">
            <MapContainer center={[origin.lat, origin.lng]} zoom={6} style={{ height: "100%", width: "100%", background: "#0b1220" }} scrollWheelZoom>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {userLoc && (
                <CircleMarker center={[userLoc.lat, userLoc.lng]} radius={8} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 1, weight: 2 }}>
                  <Popup>{isRtl ? "موقعك" : "Your location"}</Popup>
                </CircleMarker>
              )}
              {sorted.map((h, i) => {
                const color = i === 0 ? "#ef4444" : h.id === selectedId ? "#f59e0b" : "#10b981";
                return (
                  <Marker key={h.id} position={[h.lat, h.lng]} icon={makeIcon(color, i === 0 ? 36 : 28)} eventHandlers={{ click: () => setSelectedId(h.id) }}>
                    <Popup><div className="font-semibold text-sm">{h.name}</div><div className="text-xs">{h.city} · {h.type.toUpperCase()}</div></Popup>
                  </Marker>
                );
              })}
              {userLoc && selected && (
                <Polyline positions={[[userLoc.lat, userLoc.lng], [selected.lat, selected.lng]]} pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.7, dashArray: "8 8" }} />
              )}
              <FitTo points={fitPoints} />
            </MapContainer>
          </div>
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-slate-950/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{isRtl ? "تحميل…" : "Loading…"}</div>
            </div>
          )}
          {selected && userLoc && (
            <div className="absolute top-3 left-3 right-3 glass-strong rounded-2xl px-3 py-2 flex items-center gap-3 shadow-xl">
              <div className="size-9 rounded-xl bg-primary/20 grid place-items-center"><Navigation className="size-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{isRtl ? "المختار" : "Selected"}</div>
                <div className="text-sm font-semibold truncate">{selected.name}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gradient">{fmtDistance(selected._km)}</div>
                <div className="text-[10px] text-muted-foreground">{fmtDrive(selected._km)}</div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm">
          <Hospital className="size-4 text-primary" />
          <span className="font-semibold">{isRtl ? "المستشفيات" : "Hospitals"}</span>
          <span className="text-xs text-muted-foreground">({sorted.length})</span>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((h, i) => {
          const active = h.id === selectedId;
          return (
            <motion.button key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.02 }}
              onClick={() => setSelectedId(h.id)}
              className={cn("w-full text-left glass rounded-2xl p-3 flex gap-3 items-start transition", active && "ring-2 ring-primary/60 glow")}>
              <div className={cn("size-10 rounded-xl grid place-items-center shrink-0",
                i === 0 ? "bg-rose-500/20 text-rose-400" : active ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/15 text-emerald-400")}>
                <Hospital className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold truncate">{h.name}</div>
                  <span className="text-[9px] uppercase tracking-wider bg-primary/15 text-primary px-1.5 py-0.5 rounded">{h.type}</span>
                  {i === 0 && <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">{isRtl ? "الأقرب" : "Nearest"}</span>}
                </div>
                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" />{h.city} · {h.wilaya_name} ({String(h.wilaya_code).padStart(2, "0")})
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="text-primary font-semibold">{fmtDistance(h._km)}</span>
                  {h.phone && <a href={`tel:${h.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-primary"><Phone className="size-3" />{isRtl ? "اتصال" : "Call"}</a>}
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-primary"><ExternalLink className="size-3" />{isRtl ? "اتجاهات" : "Directions"}</a>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
