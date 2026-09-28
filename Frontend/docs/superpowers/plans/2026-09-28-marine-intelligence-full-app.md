# Marine Debris Intelligence Full App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the animated Marine Debris Intelligence dashboard into a responsive client-side demo app covering sonar analysis, detections, evidence, classification, maps, comparisons, analytics, reports, and settings.

**Architecture:** Keep the existing scroll-animation hero at the top of one continuous page. Render the remaining project sections directly below it in reading order, without separate screens. Add a compact sticky section bar with links to every section. Keep shared typed demo data and selected-detection/preferences state, with section links scrolling within the page. Keep uploads, simulated analysis, map graphics, and CSV export in the browser; label illustrative values as demo data.

**Tech Stack:** Existing Vite, React, TypeScript, and CSS; browser APIs for hash navigation, file previews, local storage, and CSV download. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-28-marine-dashboard-animation-design.md`

## Global Constraints

- Keep every project file and generated visual asset under `Frontend/`.
- Keep the current Marine Debris Intelligence intro and its scroll animation as the opening Dashboard section.
- Use demo data and local browser state until a backend/model API is connected.
- Use the project palette: `#06131C` background, lighter navy cards, cyan/teal primary accents, orange/red warnings, green verified states, white text, and muted blue-grey supporting text.
- Avoid unnecessary UI, map, chart, icon, animation, or backend dependencies.
- Sections use in-page anchors and normal document scrolling without introducing a routing package.
- Make clear that sample metrics, map coordinates, and simulated detections are illustrative demo values.
- File selection is local to the browser; do not transmit selected files.
- The sonar scene is a local SVG/CSS illustration; do not use remote imagery or live map tiles.
- Respect `prefers-reduced-motion`; keep all controls keyboard reachable with visible focus.

## Review Focus

- Invalid or unknown URL fragments: resolve safely to Dashboard and keep the selected page in sync with browser back/forward.
- Empty file selection, unreadable image, or unsupported preview: show an inline error while preserving the demo sonar scene.
- Analysis/reset races: disable duplicate analysis while progress is active, and reset back to labeled demo defaults.
- Detections without a valid selected ID: show a useful empty/fallback detail state rather than crashing.
- Browser storage or CSV download failure: show a visible status while leaving Settings and Reports usable.

---

## File Map

- `src/App.tsx` — renders the full ordered page and owns selected detection and shared preferences.
- `src/state/demo-data.ts` — exports typed survey, detection, evidence, and quality demo records plus lookup helpers.
- `src/state/app-types.ts` — exports `PageId`, `AnalysisPreferences`, `Detection`, `Survey`, and `QualitySummary` types shared by the app and pages.
- `src/components/metric-card.tsx` — reusable demo metric display.
- `src/components/sonar-dashboard-intro.tsx` — preserve the animated introduction and scroll its primary action to Sonar Analysis.
- `src/components/sonar-viewer.tsx` — local sonar illustration/image preview and detection, acoustic-shadow, compare, and zoom overlays.
- `src/components/detection-detail-panel.tsx` — selected detection attributes, evidence, priority, and recommended action.
- `src/components/evidence-card.tsx` — explainable-AI evidence item.
- `src/components/natural-vs-manmade.tsx` — sample natural/man-made classes and classification confidence.
- `src/components/data-table.tsx` — shared compact table styling/semantics for detection and report rows.
- `src/pages/dashboard-page.tsx` — existing animated hero, four summary metrics, recent detections, and links.
- `src/pages/sonar-analysis-page.tsx` — viewer controls, local upload/preview, simulated analysis, detection details, evidence, and classification.
- `src/pages/detections-page.tsx` — selectable detection table.
- `src/pages/detection-map-page.tsx` — local schematic map, coverage tracks, priority legend, and marker cards.
- `src/pages/survey-comparison-page.tsx` — January/June 2026 panels, change summary, and changed detections.
- `src/pages/analytics-page.tsx` — demo classification/priority summaries and scan-quality metrics/warning.
- `src/pages/reports-page.tsx` — report table and browser CSV export.
- `src/pages/settings-page.tsx` — local display/analysis preference controls and storage status.
- `src/utils/export-detections-csv.ts` — CSV serialization and browser download helper.
- `src/styles.css` — continuous page layouts, tables, viewer/map illustration, mobile behavior, focus styling, and reduced motion.

## Shared Interfaces

Define the following in `src/state/app-types.ts` before pages consume them:

```ts
export type PageId =
  | "dashboard"
  | "sonar-analysis"
  | "detections"
  | "detection-map"
  | "survey-comparison"
  | "analytics"
  | "reports"
  | "settings";

export type AnalysisPreferences = {
  showDetections: boolean;
  showAcousticShadows: boolean;
  confidenceThreshold: number;
};

export type Survey = {
  id: string;
  label: string;
  date: string;
};

export type QualitySummary = {
  overall: number;
  speckleNoise: "good" | "moderate" | "poor";
  dataGaps: "low" | "moderate" | "high";
  motionDistortion: "good" | "moderate" | "poor";
  coverage: "good" | "moderate" | "poor";
};

export type Detection = {
  id: number;
  type: string;
  confidence: number | null;
  estimatedSizeM: number | null;
  latitude: string;
  longitude: string;
  priority: "high" | "medium" | "low" | "uncertain";
  status: "review" | "verified" | "natural" | "needs-verification";
  evidence: ReadonlyArray<{ label: string; description: string }>;
  recommendedAction: string;
  surveyId: string;
  change: "new" | "removed" | "persistent" | null;
};
```

`demo-data.ts` exports `demoDetections: ReadonlyArray<Detection>`, `demoQuality: QualitySummary`, `demoSurveys: ReadonlyArray<Survey>`, `findDetection(id: number): Detection | undefined`, and `getDetectionsForSurvey(surveyId: string): ReadonlyArray<Detection>`. Detection `17` is Ghost Net, 91%, about 8.4 m, high priority, and includes linear-structure, acoustic-shadow, and texture-inconsistency evidence. The data set includes 37 records with exactly 08 high-priority records, so the dashboard, analytics, and report export use the same source; summary metrics remain 128 total scans, 37 detections, 08 high priority, and 94% scan quality. Comparison labels total 04 new, 02 removed, and 07 persistent; other records have no temporal-change label. Use surveys `survey-jan-2026` and `survey-jun-2026` with labels `January 2026` and `June 2026`.

`App` passes `selectedDetectionId: number | null` and `onSelectDetection(id: number): void` to pages that select records. Page change uses hash fragments `#/dashboard`, `#/sonar-analysis`, `#/detections`, `#/detection-map`, `#/survey-comparison`, `#/analytics`, `#/reports`, and `#/settings`. `AnalysisPreferences` defaults to detections on, acoustic shadows on, and a 50% confidence threshold.

---

### Task 1: Define shared demo records and typed app state

**Files:**
- Create: `src/state/app-types.ts`
- Create: `src/state/demo-data.ts`
- Verify: `npm run build`

**Interfaces:**
- Produces the exported types and demo-data helpers in **Shared Interfaces** for every later task.

- [x] Add the exact page, preference, detection, survey, and quality types described above. Keep IDs and priorities explicit and use `null` for unavailable confidence/size values.
- [x] Populate detections, surveys, and quality values from the approved spec. Include record #17 and survey comparison counts exactly as specified; generate stable IDs for remaining illustrative records.
- [x] Add `findDetection` and `getDetectionsForSurvey` lookup helpers and confirm their return types are `Detection | undefined` and `ReadonlyArray<Detection>` respectively.
- [x] Run `npm run build` from `Frontend/`; expected: current app still compiles with the new unused shared data modules.

### Task 2: Add app shell, hash navigation, and Dashboard page

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/components/sonar-dashboard-intro.tsx`
- Create: `src/components/app-shell.tsx`
- Create: `src/components/metric-card.tsx`
- Create: `src/pages/dashboard-page.tsx`
- Verify: `npm run build`

**Interfaces:**
- Consumes: `PageId`, `AnalysisPreferences`, and demo detection data from Task 1.
- Produces: app navigation and page selection props used by all later pages.

- [x] Implement `readPageFromHash(hash: string): PageId` in `src/App.tsx`; map the eight exact fragments from **Shared Interfaces** and fall back to `dashboard` for an empty or unknown fragment.
- [x] Implement `<AppShell activePage={page} onNavigate={setPage}>` with desktop groups Main, Intelligence, and System in the exact order from the spec. On mobile, make the drawer open/close with a semantic button, Escape key, and navigation selection.
- [x] Keep `SonarDashboardIntro` on Dashboard as the first section with its existing 128 / 37 / 08 / 94% metric cards; label values as demo data. Below it, show recent detection rows and links to Sonar Analysis and Detection Map without duplicating the metric cards.
- [x] Change the intro's current `#sonar-workspace` CTA to the Sonar Analysis route `#/sonar-analysis`; remove its disabled upload placeholder so the CTA leads to the functional page.
- [x] Add app-wide selected detection ID and settings preferences in `App`; listen for `hashchange`, update `location.hash` on navigation, and close the drawer after selection.
- [x] Apply shared navy palette, active navigation indication, semantic headings/landmarks, mobile shell layout, and visible keyboard focus without changing the approved intro animation behavior.
- [x] Run `npm run build` from `Frontend/`; expected: production build succeeds with Dashboard and every route resolving to a placeholder until its page task lands.

### Task 3: Implement the sonar viewer, controls, and detection details

**Files:**
- Create: `src/components/sonar-viewer.tsx`
- Create: `src/components/detection-detail-panel.tsx`
- Create: `src/components/evidence-card.tsx`
- Create: `src/components/natural-vs-manmade.tsx`
- Create: `src/pages/sonar-analysis-page.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Verify: `npm run build`

**Interfaces:**
- Consumes: `Detection`, shared selected detection and preferences from Tasks 1–2.
- Produces: `<SonarAnalysisPage selectedDetectionId onSelectDetection preferences onPreferencesChange />` and `<SonarViewer detections selectedDetectionId onSelectDetection preferences onPreferencesChange />`.

- [x] Implement the self-contained side-scan sonar artwork with keyboard-reachable detection targets, scan label, acoustic-shadow rendering, optional before/after comparison split, and zoom display from 50% to 200% in 10% increments.
- [x] Implement Upload Scan with an image-only file input and local object URL preview; revoke the prior object URL on replacement/unmount. Preserve demo art and show an inline error if selection or preview fails.
- [x] Implement Run Analysis as a local simulated progress action that reveals the labeled sample detections; disable duplicate runs while active. Reset returns to demo scan and default view state. Detection, acoustic shadow, and Compare controls toggle the corresponding viewer layers.
- [x] Render #17 as the initial selection with Ghost Net, 91%, ~8.4 m, illustrative coordinates, high priority, three evidence statements, and “Verify with secondary survey / ROV”. Support an empty selection state and display em dashes for missing confidence or estimated size values.
- [x] Add explainability cards for Shape, Shadow, Texture and the Natural vs Man-Made sample panel. Show “MAN-MADE — 91%” and the natural/man-made examples from the spec.
- [x] Wire selection of any viewer marker or detail/table entry to app-level `selectedDetectionId`; wire preference changes to app state so Settings and Sonar Analysis stay synchronized.
- [x] Run `npm run build` from `Frontend/`; expected: viewer and analysis route compile without additional dependencies.

### Task 4: Implement Detections and Detection Map pages

**Files:**
- Create: `src/components/data-table.tsx`
- Create: `src/pages/detections-page.tsx`
- Create: `src/pages/detection-map-page.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Verify: `npm run build`

**Interfaces:**
- Consumes: shared detections, selection props, and Sonar Analysis navigation from Tasks 1–3.
- Produces: `<DetectionsPage selectedDetectionId onSelectDetection onNavigateToSonar />` and `<DetectionMapPage selectedDetectionId onSelectDetection onNavigateToSonar />`.

- [x] Build a responsive detections table for ID, type, confidence, location, priority, and status. Selecting a row updates the shared selected detection; include text labels alongside priority colors.
- [x] Build a local schematic map illustration with clickable, keyboard-operable markers, survey coverage tracks, and High/Medium/Low/Uncertain legend. Mark all coordinates as illustrative demo data.
- [x] Show the selected map marker card with type, confidence, size, verification status, and a “View Sonar” action that navigates to Sonar Analysis with that detection selected.
- [x] Keep mobile use practical: allow the table region to scroll within its own container and stack map/card content without page-level horizontal overflow.
- [x] Run `npm run build` from `Frontend/`; expected: both pages render via app navigation and all row/marker callbacks type-check.

### Task 5: Implement Survey Comparison and Analytics pages

**Files:**
- Create: `src/pages/survey-comparison-page.tsx`
- Create: `src/pages/analytics-page.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Verify: `npm run build`

**Interfaces:**
- Consumes: `demoSurveys`, `demoQuality`, and detection change labels from Task 1; shared selection/navigation from Task 2.
- Produces: `<SurveyComparisonPage onSelectDetection onNavigateToSonar />` and `<AnalyticsPage />`.

- [x] Show January 2026 and June 2026 survey panels with a locally rendered sonar scene and a visual new-debris change marker; selecting a changed record selects it globally and opens it in Sonar Analysis.
- [x] Show change totals as 04 new detections, 02 removed, and 07 persistent. Use demo change labels from the shared detection records.
- [x] Build classification and priority breakdowns from the shared 37-record demo set; show text totals/labels as well as any CSS/SVG bars so information is not color-only.
- [x] Show scan quality 94% with Speckle Noise Good, Data Gaps Low, Motion Distortion Moderate, and Coverage Good. Include the “Rescan Recommended” warning and motion-distortion explanation state when quality is poor.
- [x] Run `npm run build` from `Frontend/`; expected: comparison and analytics routes render and use the same shared demo records.

### Task 6: Implement Reports, CSV export, and Settings persistence

**Files:**
- Create: `src/utils/export-detections-csv.ts`
- Create: `src/pages/reports-page.tsx`
- Create: `src/pages/settings-page.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Verify: `npm run build`

**Interfaces:**
- Consumes: detections and `AnalysisPreferences` from Tasks 1–2.
- Produces: `exportDetectionsCsv(detections: ReadonlyArray<Detection>): void` and Settings controls that update shared preferences.

- [x] Implement CSV export using detection ID, type, confidence, location, priority, and status. Quote/escape CSV cells, create a browser Blob download, and revoke its object URL after download. Show a visible error if export fails and leave the table available.
- [x] Render the Reports table from shared demo detections with an Export CSV action.
- [x] Render local preferences for detection overlays, acoustic shadows, and confidence threshold (0–100%). Initialize defaults from the spec and persist under the exact namespaced localStorage key `marine-debris-intelligence.preferences.v1`.
- [x] Guard localStorage reads/writes; when browser storage is unavailable or malformed, retain in-memory defaults and show a non-blocking status message.
- [x] Run `npm run build` from `Frontend/`; expected: report and settings routes compile without adding storage/export packages.

### Task 7: Finish responsive behavior, accessibility, and full app review

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: page/component styles in `src/styles.css`
- Verify: `npm run build` and browser review at desktop/mobile widths

**Interfaces:**
- Consumes: all pages and components from Tasks 1–6.
- Produces: complete navigable frontend satisfying the approved spec.

- [x] Confirm each of the eight navigation links resolves directly from its hash, active page state follows browser back/forward, and invalid fragments return to Dashboard.
- [x] Review Dashboard hero/metrics, local upload/analysis/reset, overlays and zoom, shared detection selection from viewer/table/map/comparison, comparison totals, analytics/quality warning, CSV download/error state, and settings persistence.
- [x] Review desktop and mobile layouts; confirm drawer keyboard operation, table containment, named controls/markers, visible focus, and text-plus-color priority states.
- [x] Review reduced-motion behavior and cleanup of scroll/resize/media-query listeners. Verify unreadable image, unsupported preview, storage failure, and export failure retain usable demo screens.
- [x] Run `npm run build` from `Frontend/`; expected: TypeScript and Vite production build complete successfully. Confirm every added or modified project path is under `Frontend/`.
