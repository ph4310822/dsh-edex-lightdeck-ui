# LIGHTDECK — Review

**Verdict: PASS** · probed on port **3085** (scratch `DSH_HOME=/tmp/lightdeck-dsh`, profile `lightdeck`; the user's live server on 3084 was never touched) · probe `review-raw.json` written from a clean, modal-free session.

## Programmatic probe (review-raw.json)
- **Console/page errors: 0**
- `shellPresent: true`, `workspacePresent: true` (sidebar `[data-slot="sidebar"]`, conversation `[data-conversation-scroll]`, composer `[data-composer-card]` all in the DOM)
- Theme tokens: `--edex-green` (accent) **#066fd1** ✓ · `--edex-border` **#e6e7e9** ✓ · `--edex-panel-2` **#ffffff** ✓ · `--dsw-alias-label-primary` **#182433** ✓ · `--dsw-alias-border-l1` **#e6e7e9** ✓
- `bodyBackground`: **rgb(255,255,255)** — the workspace reads as the reference's white CARD surface (the analysis's `workspaceSurface`), not a terminal black ✓
- `worldViewGone: true`; `widgetIds` = `info, cpu, processes, network-status, globe, traffic, files, preview, terminal, center` — the `globe` slot is present but now renders **LOCATIONS** (`data-testid="edex-locations-map"`, title LOCATIONS — verified by OCR of the rendered card header), not the encom globe ✓
- Workspace center: `backgroundColor: rgba(0,0,0,0)` (transparent) ✓ — the center `WidgetSection` reset holds; the visible chrome lives on the `.centerWidget` container (1px hairline border + white `DSH WORKSPACE` title strip, workspace inset below it by title height + card gap + 1px border, per the AIRTRACK inset lesson).
- Panel cells (left/right/bottom/top): `borderWidth: 0px` — the canvas treatment the analysis assigns to the frame level (`borderFeatures.frame.presence: none`) ✓; per-card 1px borders land on every widget section ✓ (granularity matches the analysis: closed white rectangles on a gray canvas).

## Visual comparison
- `vision_pixel_diff` (reference 1600×900 viewport crop vs review-shot.png 1600×900): **overall difference 5.27%**; worst regions 8.9–13.1% (side columns and bottom bar — different content by design: the eDEX shell's widget cards vs the reference's KPI grid; same surface colors throughout). The earlier 22.28% run was invalidated by the first-run API-key modal; the final diff is from a clean session.
- `vision-compare` (both images, one call): color theme matches — white cards, very light gray canvas, blue accents, dark navy text, green deltas; card styling matches — thin light borders, small radius, subtle shadows. Noted difference (accepted, structural): the rendered app is the eDEX shell layout (side bars + framed workspace) rather than the reference's single dashboard grid — the eDEX frame structure is kept by design; the reference's palette, surface language, card chrome, and widget vocabulary are reproduced within it.
- **Granularity check (zoom crops, 2–3×)**:
  - Left column: 3 distinct white cards, ~1px light-gray borders, ~5–6px rounding, subtle shadow, uppercase headers with hairline dividers (TOTAL USERS 563 + delta + dashed comparison line + MEMORY caption; ACTIVE USERS donut ~80% + MIN/MAX/TASKS row; PROCESSES table with loadavg footer) ✓
  - Right column: NETWORK STATUS (2×2 pale-blue icon tiles: DOWN/UP/IPv4 ONLINE/PING), LOCATIONS (dotted world map with blue intensity dots + region rows US 42% / EUROPE 26% / APAC 19% / OTHER 13% with mini progress bars), TRAFFIC SUMMARY ✓
  - Center: framed workspace card with the `DSH WORKSPACE` white title strip + hairline divider, inner section transparent, original DSH UI (sidebar/conversation/composer) fully visible and interactive ✓
- **Featured-widget check**: `worldViewGone: true`; the globe slot renders the LOCATIONS choropleth map per the analysis's match branch (Assumption #7) ✓.

## Workspace-present check
- Probe: `workspacePresent: true`, center transparent, `bodyBackground` = white card surface = `--edex-panel-2` ✓
- Vision: center crop shows sidebar, conversation ("Into the Unknown", "Preview", "Standard mode"), and composer; no occlusion; title strip + border frame the workspace ✓

## First-run modal handling (process note, OVERHILL lesson extended)
- The API-key onboarding modal and the versioned internal-testing notice both sit over the workspace in fresh sessions. Fixed **without touching the real `~/.dsh`**: the scratch `DSH_HOME` was seeded with copies of the real `settings.yaml` (with `ui-onboarding.welcomeNoticeVersion` present → the testing notice never renders; `ui-edex.themeColor` set to the variant accent `#066fd1`) and `.credentials.yaml` (read-only copies; the credential-missing onboarding modal therefore never mounts). Verified: a fresh headless session shows **0 dialogs**.

## Animation verification
- Static inventory: `grep -rn "@keyframes|animation:|animateTransform|requestAnimationFrame"` over the variant's client sources → **0 matches**; `transition:` count 0. No animation was introduced by this variant (the reference is a static enterprise dashboard; the replaced globe's rAF loop was removed with the encom globe).
- Runtime probe (`probe-animation.mjs`): shell animated count **0**, console errors **0** — consistent with the static inventory. Per build.md this is the documented acceptable no-animation case (nothing introduced ⇒ nothing to certify); the verdict reconciles static (0) vs runtime (0) ✓.

## GIF
- `record-gif.mjs` 4s @ 12fps → `preview.gif` (158 KB), 0 errors during capture; frames show live telemetry updating (KPIs, donut, traffic bars).

## Divergences (documented, none visual-pattern violations)
1. **Structure**: eDEX's three-bar shell + framed center workspace is kept; the reference's 4-column KPI grid is reproduced through the widget cards' content, not the shell geometry (per Assumption #5).
2. **LOCATIONS map data**: the eDEX hooks carry no geo data; the choropleth uses static sample activity (documented in `analysis.json` `widgets.matches` plan).
3. **Parent pre-estimate divergence**: the parent's vision pass estimated accent `#1677d2`; the pixel-exact modal is `#066fd1` (same hue family). The variant themed from its own measured analysis per the absolute rule; recorded in `analysis.json.measurement.divergenceFromParentEstimate`.

## Addendum — published-package boot verification (Step 5)
- The first registry install (ui-edex 0.1.0) failed to boot: the renamed
  `@danielng23/dsh-lightdeck-host-system-metrics/remote` import had been
  externalized during the post-rename build (unresolvable from the plugin
  root) instead of inlined by the GENERATED_REMOTE gate. Fixed by re-running
  `link-harness.sh` (new-name symlink) + rebuild, republished as
  **ui-edex 0.1.1**.
- Re-verified from npmjs inside `DSH_HOME=/tmp/lightdeck-dsh/profiles/
  lightdeck-verify/node_modules`: 0 console errors, `workspacePresent: true`,
  `worldViewGone: true`, accent `#066fd1`, hairline `#e6e7e9`, card surface
  `#ffffff`, `bodyBackground` white, full widget set — **identical tokens and
  structure to the local build**. The registry tarball client.js is
  byte-identical to the local build (sha256 match).
