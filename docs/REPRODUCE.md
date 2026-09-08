# Reproducing the review

The variant was reviewed on a scratch profile with a redirected home — the
user's live DSH server (port 3084) and real `~/.dsh/settings.yaml` were never
touched.

```sh
# 1. Scratch home + profile (bundles point at this repo's build)
export DSH_HOME=/tmp/lightdeck-dsh
mkdir -p $DSH_HOME/profiles/lightdeck
# package.json dsh.profile.bundles:
#   ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-balance",
#    "@danielng23/dsh-edex-lightdeck-ui"]
pnpm dsh plugin --profile lightdeck add @danielng23/dsh-edex-lightdeck-ui

# 2. Boot on a free port (the loop used 3085)
pnpm dsh --profile lightdeck --port 3085

# 3. Review probes (scripts take the port as argv[1])
node scripts/probe-review.mjs   3085 <variant-dir>   # tokens, errors, screenshot
node scripts/probe-animation.mjs 3085 <variant-dir>  # static inventory check
node scripts/record-gif.mjs     3085 <variant-dir>   # preview.gif
```

## Modal-free headless sessions
The onboarding API-key modal and the internal-testing welcome notice sit over
the workspace in fresh browser sessions. The profile home seeded with the real
`settings.yaml` (which carries `ui-onboarding.welcomeNoticeVersion`) and
`.credentials.yaml` renders clean with zero dialogs — copies only; the real
files are never modified by this variant's pipeline.

## Toolchain notes (verified 2026-09-08)
- `scripts/link-harness.sh` (DSH_HARNESS=<checkout>) links `@deepseek-ai/*`
  AND the plugin's own `@danielng23/*` packages — required BOTH for types and
  so the post-rename build can resolve the generated `.../remote` import and
  inline it (GENERATED_REMOTE gate). A rename without re-link externalizes
  the remote and the published bundle fails the client module table.
- Third-party build deps (lightningcss, codemirror suite, zod, …) must be
  present in the plugin root `node_modules` or rolldown externalizes them.
- pnpm ≥11 reads `overrides` from `pnpm-workspace.yaml`, not package.json.
