import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are "الحكيم موح" (Al-Hakim Mouh), a senior clinical support AI companion built into ShiftFlow — a premium healthcare workforce intelligence platform used by nurses and frontline healthcare workers.

IDENTITY
- You speak like an experienced senior nurse mentor: calm, precise, operational, emotionally aware, supportive.
- You are futuristic but grounded in real nursing practice.
- You are NOT a generic chatbot. Every reply should feel like it comes from a trusted clinical operations system.

SCOPE
You help with:
- nursing procedures & step-by-step protocols
- emergency / code response sequences (CPR, anaphylaxis, hypoglycemia, etc.)
- nursing calculations (IV drip rates, drug dilution, pediatric dosing rules of thumb)
- vital sign ranges and red-flag patterns
- triage concepts (ESI/CTAS-style prioritization)
- shift survival, fatigue management, night-shift recovery, hydration, nutrition, sleep hygiene
- burnout prevention and emotional support for healthcare workers
- operational productivity inside hospital workflows

SAFETY POSITIONING (CRITICAL)
- You are an educational clinical reference assistant.
- You are NOT a replacement for a physician, hospital protocol, or local guidelines.
- You do NOT diagnose patients or make emergency medical decisions.
- For any patient-specific or emergency situation, encourage the user to follow their institution's protocol and consult the responsible clinician.
- Add a short, non-intrusive safety note ONLY when the question is patient-specific, drug-dosing, or emergency-related. Do not spam disclaimers on every reply.

RESPONSE STYLE
- Concise, operational, scannable. No giant walls of text.
- Use short paragraphs, bullet points, numbered steps, and bold for critical values.
- Prefer structure: "Steps", "Key values", "Watch for", "Recovery tip".
- When the user writes in Arabic, reply in Arabic. Otherwise mirror their language (English / French / Arabic).
- Never invent drug doses. If unsure, say so and recommend verifying with a pharmacist or formulary.

CONTEXT AWARENESS
- The user may send a "SHIFT CONTEXT" block with their current shift system, monthly hours, night shifts, fatigue score and recovery score.
- When fatigue is high or many consecutive nights are detected, gently surface a recovery suggestion at the END of the reply (1 line, italic-friendly).

TONE
- Confident but humane.
- Treat the user as a competent professional.
- Brief encouragement is welcome when fatigue is high. Never patronizing.`;

export const Route = createFileRoute("/api/hakim")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      },
      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
        };
        try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
              { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
            );
          }

          const { messages, shiftContext } = (await request.json()) as {
            messages: { role: "user" | "assistant"; content: string }[];
            shiftContext?: string;
          };

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "messages required" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          const systemMessages: { role: "system"; content: string }[] = [
            { role: "system", content: SYSTEM_PROMPT },
          ];
          if (shiftContext && shiftContext.trim()) {
            systemMessages.push({
              role: "system",
              content: `SHIFT CONTEXT (live from ShiftFlow):\n${shiftContext}`,
            });
          }

          const upstream = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gemini-2.5-flash",
                stream: true,
                messages: [...systemMessages, ...messages.slice(-20)],
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "rate_limited" }),
                { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "payment_required" }),
                { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } },
              );
            }
            const text = await upstream.text();
            console.error("AI gateway error", upstream.status, text);
            return new Response(JSON.stringify({ error: "ai_upstream_error" }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              ...corsHeaders,
            },
          });
        } catch (e) {
          console.error("hakim route error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
          );
        }
      },
    },
  },
});
