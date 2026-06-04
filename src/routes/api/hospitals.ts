import { createFileRoute } from "@tanstack/react-router";

// Algeria bounding box (rough)
const DZ_BBOX = { minLat: 18.9, maxLat: 37.5, minLng: -8.7, maxLng: 12.0 };
// Algiers fallback center
const ALGIERS = { lat: 36.7538, lng: 3.0588 };

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

export const Route = createFileRoute("/api/hospitals")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const lovableKey = process.env.LOVABLE_API_KEY;
          const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
          if (!lovableKey || !mapsKey) {
            return Response.json({ error: "maps_key_missing" }, { status: 500 });
          }
          const body = (await request.json()) as { lat?: number; lng?: number; radius?: number };
          let { lat, lng } = body;
          const radius = Math.min(Math.max(body.radius ?? 30000, 1000), 50000);

          // If user is outside Algeria, center on Algiers
          if (
            typeof lat !== "number" ||
            typeof lng !== "number" ||
            lat < DZ_BBOX.minLat || lat > DZ_BBOX.maxLat ||
            lng < DZ_BBOX.minLng || lng > DZ_BBOX.maxLng
          ) {
            lat = ALGIERS.lat;
            lng = ALGIERS.lng;
          }

          const resp = await fetch(`${GATEWAY}/places/v1/places:searchNearby`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": mapsKey,
              "Content-Type": "application/json",
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.types,places.rating,places.internationalPhoneNumber,places.googleMapsUri,places.businessStatus",
            },
            body: JSON.stringify({
              includedTypes: ["hospital"],
              maxResultCount: 20,
              languageCode: "en",
              regionCode: "DZ",
              locationRestriction: {
                circle: { center: { latitude: lat, longitude: lng }, radius },
              },
              rankPreference: "DISTANCE",
            }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.error("places error", resp.status, text);
            return Response.json({ error: "places_error", status: resp.status }, { status: 500 });
          }

          const data = (await resp.json()) as {
            places?: Array<{
              id: string;
              displayName?: { text?: string };
              formattedAddress?: string;
              location?: { latitude: number; longitude: number };
              primaryType?: string;
              types?: string[];
              rating?: number;
              internationalPhoneNumber?: string;
              googleMapsUri?: string;
              businessStatus?: string;
            }>;
          };

          const hospitals = (data.places ?? [])
            .filter((p) => p.location)
            .map((p) => ({
              id: p.id,
              name: p.displayName?.text ?? "Hospital",
              address: p.formattedAddress ?? "",
              lat: p.location!.latitude,
              lng: p.location!.longitude,
              type: p.primaryType ?? p.types?.[0] ?? "hospital",
              rating: p.rating ?? null,
              phone: p.internationalPhoneNumber ?? null,
              mapsUri: p.googleMapsUri ?? null,
              status: p.businessStatus ?? null,
            }));

          return Response.json({ center: { lat, lng }, hospitals });
        } catch (e) {
          console.error("hospitals route", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "unknown" },
            { status: 500 },
          );
        }
      },
    },
  },
});
