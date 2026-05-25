# AI Agents Instruction Manual

Welcome to the ShiftFlow-Angel project AI Agent Coordination specification. This document defines the highest-priority operational directives and constraints for all AI coding agents working on this repository.

## 🤖 The AI Agent Role

As an AI engineer on ShiftFlow-Angel, you are tasked with extending, maintaining, and polishing a premium desktop & web platform designed for healthcare professionals.

## 🔄 Core Operational Cycle

For any changes:
1. **Analyze**: Thoroughly inspect existing code, state bindings, and business logic before making edits.
2. **Draft Plan**: Draft an implementation plan in `.ai/TASK.md` or as a plan review.
3. **Execute**: Implement the changes in small, isolated commits following Conventional Commits format.
4. **Verify**: Ensure the application compiles, and state management / routing behaves properly.

## 🔒 Protected Core Modules

The following modules contain critical business logic, calculations, and schemas. They **require explicit architectural approval** and rigorous plan-first review before any structural changes are introduced:

* [src/lib/shift-engine.ts](file:///C:/Users/DARKGHOST/shiftflow-angel/src/lib/shift-engine.ts) (Date cycles, fatigue calculations, stats engine)
* [src/lib/shift-systems.ts](file:///C:/Users/DARKGHOST/shiftflow-angel/src/lib/shift-systems.ts) (Cycle blueprints and pattern definitions)
* [src/lib/storage.ts](file:///C:/Users/DARKGHOST/shiftflow-angel/src/lib/storage.ts) (Persistence schema, default state, state interfaces)
* [src/lib/alarm.ts](file:///C:/Users/DARKGHOST/shiftflow-angel/src/lib/alarm.ts) (Alarm times and trigger evaluations)
* [src/lib/i18n.ts](file:///C:/Users/DARKGHOST/shiftflow-angel/src/lib/i18n.ts) (Localization translations and flow configurations)

## 🛡️ Protected Architecture Areas

The following foundational systems require a **detailed plan-first analysis** before making any modifications:

* **TanStack Start SSR configuration** (Server rendering, wrappers, entries)
* **Cloudflare deployment configuration** (Wrangler configurations, fetch endpoints)
* **Tauri integration** (Rust wrappers, configs, desktop shell features)
* **Build pipeline** (Vite configurations, bundlers, output environments)
* **Routing architecture** (Type-safe routes, code-gen file structures)
* **Persistence schema** (Local storage layout, migrations)

## 🛠️ Operational Constraints

* **Strict Scope Limits**: Never rewrite large segments of code. Focus on highly localized, minimal diffs.
* **Preserve Architectures**:
  * Keep React Context-based state management (`src/lib/app-context.tsx`).
  * Preserve local storage fallback for user persistence (`src/lib/storage.ts`).
  * Ensure full compatibility with the i18n translation library (`src/lib/i18n.ts`).
* **Zero Disclaimers**: Communicate concisely and professionally. Avoid flowery explanations or excessive pleasantries.
