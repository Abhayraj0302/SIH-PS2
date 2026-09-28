# Marine Sonar Dashboard Entrance Implementation Plan

> **Superseded:** This plan covered only the initial dashboard entrance. The approved full-app scope is planned in `2026-09-28-marine-intelligence-full-app.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite, React, and TypeScript dashboard entrance in `Frontend/` that adapts the supplied circle inversion scroll animation to marine sonar analysis.

**Architecture:** A Vite app mounts a dashboard shell. A focused `SonarDashboardIntro` component measures its own scroll viewport, derives circle/clip geometry, and reveals the final dark summary section. Global CSS owns palette and responsive styling; the dashboard shell provides the copy and demo summary data.

**Tech Stack:** Vite, React, TypeScript, CSS, browser `ResizeObserver`, `IntersectionObserver`, and `matchMedia` APIs. No component, icon, or animation libraries.

**Spec:** `docs/superpowers/specs/2026-09-28-marine-dashboard-animation-design.md`

## Global Constraints

- Keep every added project file under `Frontend/`.
- Use `#06131C` background, a slightly lighter navy for cards, cyan/teal primary accents, orange/red for warnings, green for verified states, and white/muted blue-grey text.
- Adapt all visible copy to marine debris and side-scan sonar analysis.
- Label initial scan summary values as demo data.
- With `prefers-reduced-motion: reduce`, show the completed dashboard entrance without the extended scroll sequence.
- Do not add UI, animation, icon, image, or backend dependencies.

## Review Focus

- Short viewport heights: confirm circle travel and clip alignment both use the measured hero box when its minimum height exceeds the scrollport.
- Small viewport widths: confirm the title and summary cards wrap without horizontal overflow.
- Reduced motion: confirm the dashboard content is immediately visible without needing to scroll through the animation.
- Missing `ResizeObserver`: confirm window resize updates geometry and no exception hides content.
- Scroll end and initial position: confirm title/circle alignment at load and that the summary section is reachable after the pinned sequence.
- Keyboard use: confirm the primary action has an accessible name, visible focus, and reaches the sonar workspace section.

---

### Task 1: Scaffold the Vite dashboard and implement its entrance

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- Create: `src/components/sonar-dashboard-intro.tsx`

**Interfaces:**
- `src/main.tsx` imports `App` and `src/styles.css`, then mounts `<App />` into `#root`.
- `App` supplies the fixed marine title/copy and clearly labeled demo metrics to `SonarDashboardIntro`.
- `SonarDashboardIntro` accepts `title: string`, `description: string`, `metrics: ReadonlyArray<{ label: string; value: string; tone: "default" | "warning" | "verified" }>`, and `actionLabel: string`.

- [x] **Step 1: Scaffold a React TypeScript Vite app in the existing `Frontend/` directory.** Keep generated paths inside this folder and use Vite's React TypeScript template; do not overwrite files outside it. (Configured directly after the scaffolder stalled, preserving the approved documents.)
- [x] **Step 2: Implement the dashboard shell and presentational data in `src/App.tsx`.** Use marine debris wording, mark the sample metrics as demo data, and add a local `id="sonar-workspace"` destination section for the CTA.
- [x] **Step 3: Implement `SonarDashboardIntro` in `src/components/sonar-dashboard-intro.tsx`.** Use a 300vh track with a sticky hero; use scrollport height for phase progress and measured hero width/height for circle travel, expansion, and clip coordinates. Add resize/scroll observers with cleanup and a window-resize fallback if `ResizeObserver` is unavailable. Keep title, summary, and CTA visible when geometry cannot be measured; for reduced motion, skip to the fully visible dashboard state. The CTA scrolls to `#sonar-workspace`.
- [x] **Step 4: Define global and component styles in `src/styles.css`.** Apply the exact project palette from the spec, responsive summary cards, visible keyboard focus, and the selected dark reveal surface. Avoid importing remote fonts or assets.
- [x] **Step 5: Run `npm run build` from `Frontend/`.** Expected: Vite completes a production build with no TypeScript or bundler errors.
- [x] **Step 6: Inspect the app at desktop and narrow viewport widths.** Visually confirm the scroll reveal, workspace anchor, keyboard focus, and no horizontal overflow; source-check reduced-motion and observer fallback branches. Confirm every added file is under `Frontend/`.
