# Project Coding Conventions

These standards govern style, formatting, git commits, and architectural integrity in the ShiftFlow-Angel project.

---

## 🎨 Premium Visual Standards

* **Typography**: Clean high-fidelity Google Fonts (*Inter*, *Outfit*).
* **Color Accents**: Smooth HSL color variables matched with premium glassmorphic cards (`glass-card.tsx`).
* **Micro-Animations**: Clean, localized Framer Motion animations to make interactions feel responsive and responsive.

---

## 💻 Code Formatting & Semantics

* **Imports**: Use relative imports or `@/...` aliases as configured in `tsconfig.json`.
* **State Management**: Modify context in `src/lib/app-context.tsx` and serialize using `src/lib/storage.ts`.
* **Internationalization**: Do not hardcode user-facing strings; declare them in translation tables in `src/lib/i18n.ts`.

---

## 📝 Commit Standards

Use the Conventional Commits format:
* `feat`: A new user-facing feature.
* `fix`: A localized bug fix.
* `docs`: Documentation updates.
* `refactor`: Structural optimization without logic changes.
