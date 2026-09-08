# Reference provenance

**Source**: web discovery (parent loop, Step 0) — direction "minimal light dashboard"
**URL**: https://preview.tabler.io/index.html
**Search query**: "minimal light dashboard UI website clean design"
**Captured**: headless Chromium 1600×900 — full page 1600×3649 and viewport
crop 1600×900 (`references/lightdeck-discovery/` in the loop workspace; the
crop is copied here as `reference-shot.png` and serves as the pixel-diff
`original` because probe screenshots share its frame).
**DOM facts**: `dom-facts.json` (Tabler template, 76 cards, tabler CSS custom
properties, gauges + charts present, no scanline/particle effects).

## Analysis method
1. Vision-first: CLI wrapper (`scripts/vision-call-file.sh`, gpt-5.5 via
   xcode.best) — layout regions, palette impressions, card treatment, widget
   inventory (native `vision_*` tools returned HTTP 503 this session).
2. Measurement-only refinement: `analyze-ui.py` (border width 1px, corner
   arc ≈4px), `measure-accent2.py` hue buckets (blue #066fd1 modal 14,936 px,
   green #2fb344, red #d63939), custom BMP row/corner scans (hairline rows
   #e6e7e9–#eceef0).
3. Every implemented token value lives in `analysis.json`; the theme
   implementation maps them 1:1 (see `review.md` for the verification).
