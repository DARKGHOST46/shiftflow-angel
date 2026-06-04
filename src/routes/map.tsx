import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { GlassCard } from "@/components/glass-card";
import { useApp } from "@/lib/app-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, ExternalLink, Loader2, LocateFixed, Hospital, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  component: () => (
    <AppLayout>
      <MapPage />
    </AppLayout>
  ),
});

type Hospital = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  rating: number | null;
  phone: string | null;
  mapsUri: string | null;
  status: string | null;
};

declare global {
  interface Window {
    google: any;
    __initShiftflowMap?: () => void;
  }
}

const ALGIERS = { lat: 36.7538, lng: 3.0588 };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function fmtDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function fmtDuration(s: number) {
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function MapPage() {
  const { state } = useApp();
  const isRtl = state.language === "ar";
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const hospitalMarkersRef = useRef<any[]>([]);
  const routeLineRef = useRef<any>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ km: number; sec: number } | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(ALGIERS);

  // Load Maps JS API once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps) {
      setMapsReady(true);
      return;
    }
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) return;
    window.__initShiftflowMap = () => setMapsReady(true);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&libraries=geometry&callback=__initShiftflowMap${
      channel ? `&channel=${channel}` : ""
    }`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  // Init map
  useEffect(() => {
    if (!mapsReady || !mapEl.current || mapRef.current) return;
    const g = window.google;
    mapRef.current = new g.maps.Map(mapEl.current, {
      center: ALGIERS,
      zoom: 6,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      restriction: {
        latLngBounds: { north: 38.5, south: 18.0, west: -10.0, east: 13.0 },
        strictBounds: false,
      },
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#3b82f6" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
  }, [mapsReady]);

  // Geolocate
  const locate = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported");
      return;
    }
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
      },
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };
  useEffect(() => {
    locate();
  }, []);

  // Fetch hospitals when location is set
  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      try {
        const r = await fetch("/api/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: userLoc?.lat,
            lng: userLoc?.lng,
            radius: 50000,
          }),
        });
        const data = await r.json();
        if (cancel) return;
        if (data.hospitals) {
          setHospitals(data.hospitals);
          if (data.center) setCenter(data.center);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [userLoc]);

  // Sorted by distance from user (or center)
  const origin = userLoc ?? center;
  const sorted = useMemo(() => {
    return [...hospitals]
      .map((h) => ({ ...h, _km: haversineKm(origin, h) }))
      .sort((a, b) => a._km - b._km);
  }, [hospitals, origin]);

  // Auto-select nearest on first load
  useEffect(() => {
    if (!selectedId && sorted.length > 0) {
      setSelectedId(sorted[0].id);
    }
  }, [sorted, selectedId]);

  // Render markers + user
  useEffect(() => {
    if (!mapsReady || !mapRef.current) return;
    const g = window.google;
    const map = mapRef.current;

    // User marker
    if (userLoc) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new g.maps.Marker({
          position: userLoc,
          map,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          zIndex: 999,
        });
        userCircleRef.current = new g.maps.Circle({
          map,
          center: userLoc,
          radius: 600,
          fillColor: "#3b82f6",
          fillOpacity: 0.12,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.4,
          strokeWeight: 1,
        });
      } else {
        userMarkerRef.current.setPosition(userLoc);
        userCircleRef.current?.setCenter(userLoc);
      }
    }

    // Hospital markers
    hospitalMarkersRef.current.forEach((m) => m.setMap(null));
    hospitalMarkersRef.current = sorted.map((h, i) => {
      const isNearest = i === 0;
      const marker = new g.maps.Marker({
        position: { lat: h.lat, lng: h.lng },
        map,
        title: h.name,
        icon: {
          path: "M12 2C7.6 2 4 5.6 4 10c0 5.2 6.4 11.4 7.3 12.2.4.4 1 .4 1.4 0C13.6 21.4 20 15.2 20 10c0-4.4-3.6-8-8-8zm-1 5h2v2h2v2h-2v2h-2v-2H9V9h2V7z",
          fillColor: isNearest ? "#ef4444" : selectedId === h.id ? "#f59e0b" : "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
          scale: isNearest ? 1.8 : 1.4,
          anchor: new g.maps.Point(12, 22),
        },
        zIndex: isNearest ? 500 : 100,
      });
      marker.addListener("click", () => setSelectedId(h.id));
      return marker;
    });

    // Fit bounds on first load
    if (sorted.length > 0 && userLoc) {
      const bounds = new g.maps.LatLngBounds();
      bounds.extend(userLoc);
      sorted.slice(0, 5).forEach((h) => bounds.extend({ lat: h.lat, lng: h.lng }));
      map.fitBounds(bounds, 80);
    } else if (sorted.length > 0) {
      map.setCenter({ lat: sorted[0].lat, lng: sorted[0].lng });
      map.setZoom(11);
    }
  }, [mapsReady, sorted, userLoc, selectedId]);

  // Compute route when selection changes
  useEffect(() => {
    if (!mapsReady || !selectedId || !userLoc) return;
    const target = sorted.find((h) => h.id === selectedId);
    if (!target) return;
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/route-to", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: userLoc,
            to: { lat: target.lat, lng: target.lng },
          }),
        });
        const data = await r.json();
        if (cancel || !data.polyline) return;
        const g = window.google;
        const path = g.maps.geometry.encoding.decodePath(data.polyline);
        if (routeLineRef.current) routeLineRef.current.setMap(null);
        routeLineRef.current = new g.maps.Polyline({
          path,
          map: mapRef.current,
          strokeColor: "#3b82f6",
          strokeOpacity: 0.9,
          strokeWeight: 5,
          icons: [
            {
              icon: { path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, strokeColor: "#fff" },
              offset: "100%",
            },
          ],
        });
        setRouteInfo({ km: data.distanceMeters / 1000, sec: data.durationSeconds });
        const bounds = new g.maps.LatLngBounds();
        bounds.extend(userLoc);
        bounds.extend({ lat: target.lat, lng: target.lng });
        mapRef.current.fitBounds(bounds, 100);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [mapsReady, selectedId, userLoc, sorted]);

  const selected = sorted.find((h) => h.id === selectedId);
  const browserKey = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-32 space-y-4 relative z-10" dir={isRtl ? "rtl" : "ltr"}>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="pulse-dot" />
            <span>{isRtl ? "خريطة المستشفيات" : "Hospital map"}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gradient">
            {isRtl ? "مستشفيات الجزائر" : "Algeria Hospitals"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isRtl
              ? "أقرب المرافق الصحية مع مسار مباشر من موقعك."
              : "Closest medical facilities with live driving routes from your location."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={locate} className="glass shrink-0">
          <LocateFixed className="size-4 me-1.5" />
          {isRtl ? "موقعي" : "Locate"}
        </Button>
      </motion.header>

      {!browserKey && (
        <GlassCard className="border-amber-500/40">
          <div className="flex gap-2 items-start text-sm">
            <AlertTriangle className="size-5 text-amber-400 shrink-0" />
            <span>Google Maps key missing. Please reconnect the Google Maps connector.</span>
          </div>
        </GlassCard>
      )}

      {locError && (
        <GlassCard className="border-rose-500/30">
          <div className="flex gap-2 items-start text-sm">
            <AlertTriangle className="size-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-medium">
                {isRtl ? "تعذر تحديد موقعك" : "Could not get your location"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isRtl
                  ? "نعرض المستشفيات حول الجزائر العاصمة."
                  : "Showing hospitals around Algiers instead."}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="overflow-hidden p-0">
        <div className="relative">
          <div ref={mapEl} className="w-full h-[420px] bg-slate-950" />
          {(!mapsReady || loading) && (
            <div className="absolute inset-0 grid place-items-center bg-slate-950/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {loading
                  ? isRtl ? "جاري البحث عن المستشفيات…" : "Finding hospitals…"
                  : isRtl ? "تحميل الخريطة…" : "Loading map…"}
              </div>
            </div>
          )}
          {routeInfo && selected && (
            <div className="absolute top-3 left-3 right-3 glass-strong rounded-2xl px-3 py-2 flex items-center gap-3 shadow-xl">
              <div className="size-9 rounded-xl bg-primary/20 grid place-items-center">
                <Navigation className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isRtl ? "أقرب مسار" : "Live route"}
                </div>
                <div className="text-sm font-semibold truncate">{selected.name}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-gradient">{fmtDistance(routeInfo.km)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fmtDuration(routeInfo.sec)}
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm">
          <Hospital className="size-4 text-primary" />
          <span className="font-semibold">
            {isRtl ? "المستشفيات القريبة" : "Nearby hospitals"}
          </span>
          <span className="text-xs text-muted-foreground">({sorted.length})</span>
        </div>
        {sorted[0] && (
          <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold">
            {isRtl ? "الأقرب" : "Nearest"} · {fmtDistance(sorted[0]._km)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {sorted.map((h, i) => {
          const active = h.id === selectedId;
          return (
            <motion.button
              key={h.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedId(h.id)}
              className={cn(
                "w-full text-left glass rounded-2xl p-3 flex gap-3 items-start transition",
                active && "ring-2 ring-primary/60 glow",
              )}
            >
              <div
                className={cn(
                  "size-10 rounded-xl grid place-items-center shrink-0",
                  i === 0
                    ? "bg-rose-500/20 text-rose-400"
                    : active
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/15 text-emerald-400",
                )}
              >
                <Hospital className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold truncate">{h.name}</div>
                  {i === 0 && (
                    <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                      {isRtl ? "الأقرب" : "Nearest"}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" />
                  {h.address}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="text-primary font-semibold">{fmtDistance(h._km)}</span>
                  {h.rating != null && <span>★ {h.rating.toFixed(1)}</span>}
                  {h.phone && (
                    <a
                      href={`tel:${h.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="size-3" />
                      {isRtl ? "اتصال" : "Call"}
                    </a>
                  )}
                  {h.mapsUri && (
                    <a
                      href={h.mapsUri}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <ExternalLink className="size-3" />
                      Maps
                    </a>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
        {!loading && sorted.length === 0 && (
          <GlassCard>
            <div className="text-sm text-muted-foreground text-center py-4">
              {isRtl
                ? "لم يتم العثور على مستشفيات في هذه المنطقة."
                : "No hospitals found in this area."}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
