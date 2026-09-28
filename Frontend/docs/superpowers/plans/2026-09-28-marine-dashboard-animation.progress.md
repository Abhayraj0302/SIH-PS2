# SDD ledger — plan: docs/superpowers/plans/2026-09-28-marine-dashboard-animation.md

Pre-flight: one task; `main` checkout is the current project. Ruling: keep all implementation and plan artifacts under `Frontend/` and work in the existing checkout — the user explicitly constrained project changes to that folder and approved Native execution; a managed worktree would place the checkout outside it. Cost if wrong: changes remain uncommitted on `main` until the user chooses how to integrate them.

Task 1: complete (`npm run build` → pass; desktop and narrow previews, CTA fragment navigation, and visible keyboard focus checked in browser). The initial `npm create vite` attempt stalled without writing files; configured the app directly inside `Frontend/` to preserve the approved spec and plan.

Final review: source-based reviewer found no Critical or Minor issues and one Important short-viewport geometry mismatch. Fixed by measuring the hero box separately from the scrollport; subsequent `npm run build` passed. The short-height case was checked against the measured-box calculation in source, not visually emulated in the browser.

Final: fixed short-viewport circle/clip mismatch — circle origin and clip center now use measured hero dimensions while scroll phase progress uses scrollport height; `npm run build` passed. Remaining verification limit: no browser-emulated short-height, reduced-motion, or missing-observer session was available; those branches were reviewed in source.
