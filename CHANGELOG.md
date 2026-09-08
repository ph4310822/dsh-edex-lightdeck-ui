# CHANGELOG

## 0.1.1 (2026-09-08)

- **Registry boot fix**: `@danielng23/dsh-lightdeck-client-ui-edex` now
  resolves `@danielng23/dsh-lightdeck-host-system-metrics/remote` at build
  time (the generated remote client is inlined into the browser bundle), so
  the published tarballs boot from a clean profile install without a module
  table miss. Verified from npmjs in a fresh profile: 0 console errors,
  identical computed tokens to the local build (accent `#066fd1`, hairline
  `#e6e7e9`, white card surface).

## 0.1.0 (2026-09-08)

- Initial LIGHTDECK release: minimal light dashboard theme driven by the
  Tabler preview dashboard reference (web-captured, vision-analyzed,
  pixel-measured).
- Light palette: canvas `#f6f8fb`, cards `#ffffff`, accent `#066fd1`,
  text `#182433` / `#667085`, success `#2fb344`, error `#d63939`.
- Card language: 1px `#e6e7e9` hairline borders, 4px radius, subtle
  elevation, uppercase card headers with hairline dividers; bare canvas
  panel cells; no glow, no scanlines.
- Widgets: TOTAL USERS (KPI + sparkline, info slot), ACTIVE USERS (donut
  gauge, cpu slot), NETWORK STATUS (icon stat tiles), TRAFFIC SUMMARY
  (blue/green bars), **LOCATIONS** (dotted choropleth world map replacing
  the WORLD VIEW globe).
- Workspace chrome: center card with `DSH WORKSPACE` white title strip +
  hairline frame; workspace background tokens overridden to the white card
  surface; light composer + sidebar.
- Reviewed PASS: 0 console errors, granularity zoom checks, 5.27% pixel
  difference vs the reference crop.
