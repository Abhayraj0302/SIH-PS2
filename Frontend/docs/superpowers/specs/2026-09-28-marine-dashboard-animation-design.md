# Marine Debris Intelligence Frontend Design

## Goal

Grow the existing animated Marine Debris Intelligence intro into the full
frontend described by the supplied screen references. Preserve the opening
page and its circle animation, then provide a working demo flow for sonar
analysis, detections, evidence, classification, maps, comparisons, quality,
analytics, reports, and settings.

## Approved direction and constraints

- Use the existing Vite, React, and TypeScript foundation in `Frontend/`.
- Keep every project file and generated visual asset under `Frontend/`.
- Keep the current Marine Debris Intelligence intro and its scroll animation as
  the opening Dashboard section.
- Build the product screens around the navigation and flow in the user
  references.
- Use demo data and local browser state until a backend/model API is connected.
- Use the project palette: `#06131C` background, lighter navy cards, cyan/teal
  primary accents, orange/red warnings, green verified states, white text, and
  muted blue-grey supporting text.
- Avoid unnecessary UI, map, chart, icon, animation, or backend dependencies.

## Page structure

Present the entire app as one continuous page with normal document scrolling.
Do not use a persistent sidebar, mobile drawer, or separate routed screens.
Keep the animated hero first, followed by the dashboard overview and each
information section in order. A compact sticky section bar links to all
sections, highlights the section currently in view, and remains horizontally
scrollable on narrow screens. In-page links scroll directly to relevant
sections without introducing a routing package.

### Dashboard

Keep the animated Marine Debris Intelligence hero at the top, followed by four
demo metric cards for total scans (128), detections (37), high priority (08),
and scan quality (94%), then recent detections and the remaining app sections.

### Sonar Analysis

This is the primary working screen. Use a large side-scan sonar viewer with a
clearly labeled demo sonar scene and detection overlays. Place analysis controls
near the viewer: Upload Scan, Run Analysis, Reset, Toggle Detection, Toggle
Acoustic Shadow, Compare, and zoom in/out with a displayed zoom percentage.

Selecting a detection opens its detail panel with ID, object class, confidence,
estimated size, illustrative location, evidence, priority, and recommended
action. For detection #17 use the reference example: Ghost Net, 91% confidence,
about 8.4 m, high priority, with linear structure, acoustic shadow, and texture
inconsistency evidence. Make it clear all coordinates and inference results are
demo values.

Below the viewer, show the Explainable AI evidence cards for shape, shadow, and
texture, followed by a Natural vs Man-Made comparison. Use the reference
classification example MAN-MADE — 91% and sample classes such as rock, coral,
and sand ripple versus ghost net, metal, and cable.

### Detections

Provide a sortable-looking demo table for detection ID, type, confidence,
location, priority, and status. Selecting a row selects the same detection
shown in Sonar Analysis and provides a route to inspect it there.

### Detection Map

Use a full-page, local schematic map with clickable demo markers, sonar survey
coverage tracks, and a legend for high, medium, low, and uncertain priorities.
Selecting a marker shows a compact detection card and a “View Sonar” action.
Label the map and coordinates as illustrative demo data; do not imply they are
live geographic positions.

### Survey Comparison

Show side-by-side demo surveys for January 2026 and June 2026 with an AI change
detection summary. Include the example counts: 04 new detections, 02 removed,
and 07 persistent. Selecting a changed detection links to its details.

### Analytics

Show summary charts/cards derived from the same demo detections, including
classification and priority breakdowns. Include the sonar quality summary and
parameters from the references: overall quality 94%, speckle noise Good, data
gaps Low, motion distortion Moderate, and coverage Good. When quality is poor,
show a Rescan Recommended notice with the motion-distortion explanation.

### Reports

Show a report table with ID, type, confidence, location, priority, and status,
plus an Export CSV action generated from the current demo detections in the
browser.

### Settings

Provide a small set of local display and analysis preferences, including
detection overlays, acoustic shadows, and a confidence threshold. Persist only
in browser storage; do not add accounts or server settings.

## Demo interactions and data flow

Use one typed demo store shared by all pages. It contains surveys, detections,
priorities, status, confidence, illustrative coordinates, evidence, quality
metrics, and temporal-change labels. Selecting a detection on the viewer, map,
or table updates the shared selected detection.

File selection is local to the browser. A selected image can be previewed in
the viewer; no file is transmitted. Run Analysis simulates progress and then
shows labeled sample detections. Reset clears the selected local scan and
returns to demo defaults. Detection, acoustic-shadow, compare, and zoom
controls change the visible viewer state. CSV export uses the visible demo
detection data.

The sonar scene should be a small self-contained SVG/CSS illustration stored in
the frontend rather than a remote image or live map tile. The demo must never
present its sample metrics, map coordinates, or simulated detections as live
model output.

## Architecture

- `src/main.tsx` mounts the app and global styles.
- `src/App.tsx` renders the ordered single-page experience and owns shared
  state.
- `src/state/demo-data.ts` defines typed demo surveys, detections, and quality
  values.
- `src/components/` contains reusable metric/status components, the sonar
  viewer, and detection details.
- `src/pages/` contains the Dashboard, Sonar Analysis, Detections, Detection
  Map, Survey Comparison, Analytics, Reports, and Settings sections.
- `src/styles.css` owns the shared palette, responsive layout, focus states, and
  reduced-motion behavior.

Use React and browser APIs already available in the app. Keep interactions
client-side and avoid adding dependencies unless implementation reveals a
specific requirement that cannot be met with the current stack.

## Accessibility and responsive behavior

- In-page links and controls use semantic links/buttons and keyboard-visible
  focus.
- Detection markers and viewer controls are keyboard reachable and have
  accessible names; priority is conveyed with text and color.
- At mobile widths, stack the sonar viewer and detail panel, and keep tables
  usable without page-wide horizontal overflow.
- Respect `prefers-reduced-motion`; the dashboard intro should show its final
  state without the extended scroll sequence.
- Clean up scroll, resize, and media-query listeners when components unmount.

## Failure behavior and limits

- If browser file reading is unsupported or a selected image cannot load, show
  an inline error and preserve the demo survey.
- If observers are unavailable, fall back to static content and window resize
  handling where needed.
- If CSV generation fails, show a visible error and keep the report table
  usable.
- Sonar inference, real geospatial positions, map tiles, API persistence,
  authentication, and real report generation are outside this frontend demo.

## Verification

After implementation, run `npm run build` from `Frontend/`. Review the long
page in the browser at desktop and mobile widths. Check the landing animation,
in-page scrolling, upload/analysis/reset demo flow, detection
selection across viewer/table/map, overlays and zoom controls, comparison
counts, scan-quality warning, CSV export, settings persistence, keyboard focus,
and reduced-motion behavior. Confirm all project changes stay under
`Frontend/`.
