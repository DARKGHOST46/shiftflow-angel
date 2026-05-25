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

## 🛠️ Operational Constraints

* **Strict Scope Limits**: Never rewrite large segments of code. Focus on highly localized, minimal diffs.
* **Preserve Architectures**:
  * Keep React Context-based state management (`src/lib/app-context.tsx`).
  * Preserve local storage fallback for user persistence (`src/lib/storage.ts`).
  * Ensure full compatibility with the i18n translation library (`src/lib/i18n.ts`).
  * Keep the core shift cycle pattern evaluation logic inside `src/lib/shift-engine.ts`.
* **Zero Disclaimers**: Communicate concisely and professionally. Avoid flowery explanations or excessive pleasantries.
