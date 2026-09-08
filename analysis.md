# LIGHTDECK — Analysis (Tabler preview dashboard, "minimal light dashboard")

**Reference**: `references/lightdeck-discovery/reference-shot.png` (viewport crop, 1600×900) — live capture of https://preview.tabler.io/index.html
**Method**: vision-first (CLI wrapper `vision-call-file.sh`, gpt-5.5) + measurement-only pixel scans (`analyze-ui.py`, `measure-accent2.py`, custom BMP row/corner scans). Native `vision_*` tools returned HTTP 503 (decommissioned upstream model) — CLI fallback per the sanctioned session pattern.

## What the reference is
Tabler's open-source dashboard demo: a **light enterprise analytics dashboard** — white bordered cards floating on a cool-gray canvas, a single strong blue accent, flat hairline borders, restrained shadows, green/red reserved for semantic deltas. No sidebars; two-tier top nav; centered max-width 4-column card grid.

## Theme (measured)
| Token | Value | Evidence |
|---|---|---|
| Canvas background | `#f6f8fb` | vision (#F5F7FA–#F6F8FB); gutters between cards |
| Card fill | `#ffffff` | pixel scan: 90% white share; vision |
| Primary accent | `#066fd1` | pixel modal 14,936 px, flat p25/p50/p75 (buttons, active-nav underline, charts, progress, map) — Tabler's own primary; parent's pre-estimate #1677d2 is the same hue family; the pixel-exact value wins |
| Text primary | `#182433` | vision (dark navy headings/values) |
| Text secondary | `#667085` | vision (muted blue-gray labels) |
| Success | `#2fb344` | pixel modal 1,549 px (positive deltas, progress segments) |
| Error | `#d63939` | pixel modal 352 px (negative deltas) |
| Pale blue tint | `#ebf3fb` | bright-text cluster (welcome card background) |
| Glow | **none** | flat enterprise hairlines; shadow at most `0 1px 2px rgba(16,24,40,0.04)` |

## Border language (the signature: closed white rectangles on a gray canvas)
- **Cards (WidgetSection level)**: `full` — 1px solid `#e6e7e9`, radius 4px, white fill, subtle shadow, ~16px floating gaps. Measured: 1px gray lines at y=204/242/465/627/717/734 (runs to 630px); corner arc profile ≈4px (vision 4–8px).
- **Frame (panel cells)**: `none` — the page has no outer frame; bar cells are bare canvas `#f6f8fb`. Per-card treatment lives ONLY on the widget sections.
- **Dividers**: 1px `#e6e7e9` hairlines under card headers / between rows.
- **Inputs**: 1px `#d0d5dd`, radius 4px (derived gray-300 family; focus = soft blue halo).
- **Active indicators**: thin 2px `#066fd1` underline on the active nav item; pale blue `#ebf3fb` tint on active surfaces; no left bars, no brackets, no glow.

## Widgets (10 in viewport + full-page inventory of 22)
Welcome card (illustration + 2 progress bars, pale blue) · TOTAL USERS (KPI + sparkline + dashed comparison) · ACTIVE USERS (donut gauge 58%) · SALES (progress bar) · REVENUE / NEW CLIENTS (sparklines) · ACTIVE SUBSCRIPTIONS (mini bars) · 4 icon stat tiles · TRAFFIC SUMMARY (stacked blue+green bars) · LOCATIONS (blue choropleth world map).

### Reconciliation
| Reference widget | eDEX slot | Match | Plan |
|---|---|---|---|
| ACTIVE USERS (donut) | `cpu` | high | live CPU% drives the donut (blue arc, `#dce1e7` track) |
| TOTAL USERS (KPI+sparkline) | `info` | partial | live metric history drives the sparkline |
| TRAFFIC SUMMARY (stacked bars) | `traffic` | high | live rx/tx history, blue+green series |
| STAT TILES (icon tiles) | `network-status` | partial | 2×2 compact live tiles |
| **LOCATIONS (world map)** | `globe` (WORLD VIEW) | high — world-view equivalent (Assumption #7) | blue choropleth-style map replaces the globe; static sample activity points (no geo hooks — documented divergence) |

Unmatched & left as-is: `processes` (no reference counterpart), bottom `files/preview/terminal`. WELCOME BACK / SALES / REVENUE / NEW CLIENTS / ACTIVE SUBSCRIPTIONS have no free slots — their language is reproduced by the replacements above.

## Shell mapping for implementation
- `--edex-bg`/`--edex-panel` = `#f6f8fb` canvas · `--edex-panel-2` = `#ffffff` card surface · `--edex-border` = `#e6e7e9` · accent token (`--edex-green`) = `#066fd1` · `--edex-red`/`--edex-amber` = `#d63939`
- Workspace tokens (`--dsw-alias-bg-*`, `--dsw-specific-sidebar-fill`, `--dsw-specific-input-major`) = **`#ffffff` card surface** — the DSH workspace must read as the same white surface as the cards.
- Per-card treatment on `WidgetSection` only; **center slot stays transparent**; center container `.centerWidget` carries the same card chrome + a white title strip (hairline bottom border, dark uppercase title) with the workspace inset below it.
- Typography: Inter-like sans for titles/values/KPIs (light enterprise look) instead of terminal monospace flourishes.
