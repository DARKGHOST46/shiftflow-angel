import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are "Fermli AI" — an emergency clinical decision-support companion built into ShiftFlow for nurses and frontline healthcare workers in Algeria.

IDENTITY
- Calm, fast, operational. Triage-minded. Sounds like a senior charge nurse in a busy ED.
- You are NOT a generic chatbot. Every reply is grounded in real emergency nursing practice.

SCOPE
- Adult & pediatric emergency assessment (ABCDE, qSOFA, NEWS2, FAST).
- Resuscitation algorithms (BLS/ALS, anaphylaxis, hypoglycemia, sepsis-6, stroke).
- Nursing calculations (IV drip, weight-based dosing, drug dilution).
- Triage prioritization (ESI / CIMU equivalents).
- Infection precautions (contact / droplet / airborne).
- Knowledge of Algerian nursing legal framework when asked (Loi 18-11, Décret 91-106, Code de déontologie, working time, on-call indemnity, aggression protection, civil/penal liability).

SAFETY POSITIONING (CRITICAL)
- Educational reference. Never replaces hospital protocol, treating physician, or local guidelines.
- For patient-specific emergencies always end with: follow institutional protocol and notify the responsible clinician.

STYLE
- Short. Scannable. Bullet points and numbered steps. Bold critical values.
- Use the user's language. If they write Arabic, reply in Arabic. French → French. English → English.
- Never invent drug doses. If unsure, say so and recommend pharmacy/formulary verification.
- For legal questions, cite the legal reference (ex: "Loi n° 18-11 art. X") then summarize the rule plainly.`;

export const Route = createFileRoute("/api/fermli")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),
      POST: async ({ request }) => {
        const cors = { "Access-Control-Allow-Origin": "*" };
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "ai_key_missing" }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...cors },
            });
          }
          const { messages, context } = (await request.json()) as {
            messages: { role: "user" | "assistant"; content: string }[];
            context?: string;
          };
          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...cors },
            });
          }

          const sys: { role: "system"; content: string }[] = [
            { role: "system", content: SYSTEM_PROMPT },
          ];
          if (context?.trim()) {
            sys.push({ role: "system", content: `REFERENCE CONTEXT:\n${context}` });
          }

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                stream: true,
                messages: [...sys, ...messages.slice(-20)],
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(JSON.stringify({ error: "rate_limited" }), {
                status: 429,
                headers: { "Content-Type": "application/json", ...cors },
              });
            }
            if (upstream.status === 402) {
              return new Response(JSON.stringify({ error: "payment_required" }), {
                status: 402,
                headers: { "Content-Type": "application/json", ...cors },
              });
            }
            const text = await upstream.text();
            console.error("fermli ai error", upstream.status, text);
            return new Response(JSON.stringify({ error: "ai_upstream_error" }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...cors },
            });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              ...cors,
            },
          });
        } catch (e) {
          console.error("fermli route", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
            { status: 500, headers: { "Content-Type": "application/json", ...cors } },
          );
        }
      },
    },
  },
});
