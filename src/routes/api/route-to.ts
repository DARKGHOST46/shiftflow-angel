import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

export const Route = createFileRoute("/api/route-to")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const lovableKey = process.env.LOVABLE_API_KEY;
          const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
          if (!lovableKey || !mapsKey) {
            return Response.json({ error: "maps_key_missing" }, { status: 500 });
          }
          const { from, to } = (await request.json()) as {
            from: { lat: number; lng: number };
            to: { lat: number; lng: number };
          };
          if (!from || !to) {
            return Response.json({ error: "from/to required" }, { status: 400 });
          }

          const resp = await fetch(
            `${GATEWAY}/routes/directions/v2:computeRoutes`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "X-Connection-Api-Key": mapsKey,
                "Content-Type": "application/json",
                "X-Goog-FieldMask":
                  "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction",
              },
              body: JSON.stringify({
                origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
                destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
                travelMode: "DRIVE",
                routingPreference: "TRAFFIC_AWARE",
                regionCode: "DZ",
                languageCode: "en",
                computeAlternativeRoutes: false,
              }),
            },
          );

          if (!resp.ok) {
            const text = await resp.text();
            console.error("routes error", resp.status, text);
            return Response.json({ error: "routes_error", status: resp.status }, { status: 500 });
          }

          const data = (await resp.json()) as {
            routes?: Array<{
              duration?: string;
              distanceMeters?: number;
              polyline?: { encodedPolyline?: string };
              legs?: Array<{
                steps?: Array<{
                  navigationInstruction?: { instructions?: string; maneuver?: string };
                }>;
              }>;
            }>;
          };
          const r = data.routes?.[0];
          if (!r) return Response.json({ error: "no_route" }, { status: 404 });

          return Response.json({
            distanceMeters: r.distanceMeters ?? 0,
            durationSeconds: r.duration ? parseInt(r.duration) : 0,
            polyline: r.polyline?.encodedPolyline ?? "",
            steps:
              r.legs?.[0]?.steps
                ?.map((s) => s.navigationInstruction?.instructions)
                .filter(Boolean) ?? [],
          });
        } catch (e) {
          console.error("route-to", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "unknown" },
            { status: 500 },
          );
        }
      },
    },
  },
});
