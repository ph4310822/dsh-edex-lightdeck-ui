/**
 * eDEX theme-color setting: the single durable accent that drives both the
 * shell frame's palette (`--edex-*`) and the terminal token override layer
 * over the original UI (`--dsw-alias-*`). One color in, a full CRT family
 * out — primary, dim midtone, dark border, and a faint tinted panel tone —
 * while the semantic accents (amber warn, red error, cyan info) stay fixed.
 * Shared by the Host loader entry (schema registration) and the browser half
 * (scope binding, token overrides, and the settings row).
 */
import z from '@deepseek-ai/schemastery'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Settings namespace owned by the eDEX shell plugin. */
export const EDEX_SETTINGS_NAMESPACE = 'ui-edex'

/** Field carrying the selected theme color. */
export const THEME_COLOR_FIELD = 'themeColor'

/** The default theme color — the LIGHTDECK analyzed dashboard blue. */
export const DEFAULT_THEME_COLOR = '#066fd1'

/** Durable theme-color section shared by the Host schema and the browser scope. */
export interface EdexSettings {
  /** The accent color driving the whole eDEX palette. */
  themeColor: string
}

/** Durable theme-color schema; also the wire envelope the browser scope validates against. */
export const EdexSettingsSchema: z<EdexSettings> = z.object({
  [THEME_COLOR_FIELD]: z.string().default(DEFAULT_THEME_COLOR),
})

/** One selectable preset swatch. */
export interface ThemeColorPreset {
  /** Stable preset id (the swatch key). */
  id: string
  /** Locale key for the swatch's accessible name. */
  labelKey: string
  /** The accent color this preset applies. */
  color: string
}

/** Preset swatches offered in the Theme Color settings row. */
export const THEME_COLOR_PRESETS: readonly ThemeColorPreset[] = Object.freeze([
  { id: 'analyzed', labelKey: 'edex.preset.analyzed', color: '#066fd1' },
  { id: 'amber', labelKey: 'edex.preset.amber', color: '#2fb344' },
  { id: 'cyan', labelKey: 'edex.preset.cyan', color: '#d63939' },
  { id: 'violet', labelKey: 'edex.preset.violet', color: '#405d7a' },
  { id: 'blue', labelKey: 'edex.preset.blue', color: '#667085' },
])

/**
 * The semantic accents that stay fixed across theme colors, from the
 * LIGHTDECK analysis: success green #2fb344 and error red #d63939 are
 * measured deltas; no warn color exists in the reference, so the amber slot
 * carries the muted secondary text tone; cyan repeats the info blue.
 */
export const FIXED_ACCENTS = Object.freeze({
  amber: '#667085',
  red: '#d63939',
  cyan: '#066fd1',
  success: '#2fb344',
})

/** The reference's measured primary text color (dark navy headings/values). */
export const LIGHTDECK_TEXT = '#182433'
/** The measured canvas gray between the cards. */
export const LIGHTDECK_CANVAS = '#f6f8fb'

/** The full eDEX palette derived from one accent color. */
export interface EdexPalette {
  /** The primary accent (text, icons, fills). */
  primary: string
  /** Muted midtone (secondary text, icon tints). */
  dim: string
  /** Dark border tone. */
  border: string
  /** Faint tinted panel background. */
  panel2: string
}

/** Normalize an #rgb/#rrggbb hex to lowercase #rrggbb, or null when invalid. */
export function normalizeHex(value: string): string | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (match === null) return null
  const hex = match[1] as string
  if (hex.length === 3) return `#${hex.split('').map(c => c + c).join('')}`.toLowerCase()
  return `#${hex}`.toLowerCase()
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function channel(value: number): string {
  return clamp(value).toString(16).padStart(2, '0')
}

/** #rrggbb → 0..255 channels (the caller has already normalized). */
function hexToRgb(color: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  }
}

/**
 * Derive one tone from a hex color at a target lightness (0..100). The
 * LIGHTDECK family keeps the reference's enterprise hairline grays instead of
 * the classic CRT desaturation: a saturate-then-neutralize curve that lands
 * borders/dividers in the #dfe3ea family and midtones in the slate #5f6c81
 * family while the primary stays the measured dashboard blue.
 */
function tone(color: string, lightness: number, saturationScale: number): string {
  const { r, g, b } = hexToRgb(normalizeHex(color) ?? DEFAULT_THEME_COLOR)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  s *= saturationScale
  const target = clamp(lightness) / 100
  const q = target < 0.5 ? target * (1 + s) : target + s - target * s
  const p = 2 * target - q
  const hue = (value: number): number => {
    let t = value
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return `#${channel(hue(h / 360 + 1 / 3) * 255)}${channel(hue(h / 360) * 255)}${channel(hue(h / 360 - 1 / 3) * 255)}`
}

/** Derive the LIGHTDECK light-dashboard family from one accent color. The
    neutrals are the reference's measured enterprise grays (slate secondary
    text, hairline border, white card surface) — tinting them from the accent
    would blue-shift the whole canvas away from the measured palette. */
export function paletteFor(color: string): EdexPalette {
  const primary = normalizeHex(color) ?? DEFAULT_THEME_COLOR
  return {
    primary,
    dim: '#667085',
    border: '#e6e7e9',
    panel2: '#ffffff',
  }
}

/** The eDEX shell frame's CSS variables for one palette (amber/red/cyan stay in the stylesheet). */
export function shellVarsFor(palette: EdexPalette): Record<string, string> {
  return {
    '--edex-green': palette.primary,
    '--edex-dim': palette.dim,
    '--edex-border': palette.border,
    '--edex-panel-2': palette.panel2,
  }
}

/**
 * The full `--edex-*` variable set for the ORIGINAL UI (the composer, sidebar,
 * and conversation scrollbar live outside the shell frame, so the theme CSS
 * resolves these from `body` — set there by the browser half, with the static
 * accents joining the dynamic palette). The shell frame defines its own copy
 * on `.shell` and overrides it inline, so the two never fight.
 */
export function bodyVarsFor(palette: EdexPalette): Record<string, string> {
  return {
    ...shellVarsFor(palette),
    '--edex-amber': FIXED_ACCENTS.amber,
    '--edex-red': FIXED_ACCENTS.red,
    '--edex-cyan': FIXED_ACCENTS.cyan,
    '--edex-success': FIXED_ACCENTS.success,
    '--edex-text': LIGHTDECK_TEXT,
  }
}

/** One override-layer token value pair; both palettes carry the same value (the terminal skin is scheme-invariant). */
function both(value: string): { light: string; dark: string } {
  return { light: value, dark: value }
}

/**
 * The token override layer that recolors the whole original UI — every label
 * token that feeds icon glyphs included — from one palette. `label-tertiary`
 * and `label-caption` are the specific tokens behind the small icons beside
 * tool names (Bash / Read / Think / …) and their separators, so overriding
 * them is what makes those glyphs theme-colored like every other icon.
 */
export function tokenOverridesFor(palette: EdexPalette): ThemeTokenOverrides {
  return {
    // The workspace reads as the reference's white CARD surface: the DSH
    // center shares the dashboard's card fill, not a terminal black (the
    // shell panels stay the gray canvas so the white cards pop).
    '--dsw-alias-bg-base': both('#ffffff'),
    '--dsw-alias-bg-layer-1': both('#ffffff'),
    '--dsw-alias-bg-layer-2': both('#ffffff'),
    '--dsw-alias-bg-overlay': both('#ffffff'),
    '--dsw-alias-border-l1': both('#e6e7e9'),
    '--dsw-alias-border-l2': both('#d0d5dd'),
    '--dsw-alias-border-l3': both(palette.primary),
    '--dsw-alias-brand-primary': both(palette.primary),
    '--dsw-alias-label-primary': both(LIGHTDECK_TEXT),
    '--dsw-alias-label-primary-bluish': both(palette.primary),
    '--dsw-alias-label-primary-dimmed': both('#404c5c'),
    '--dsw-alias-label-secondary': both('#667085'),
    '--dsw-alias-label-tertiary': both('#8492a6'),
    '--dsw-alias-label-caption': both('#8492a6'),
    '--dsw-alias-state-error-primary': both(FIXED_ACCENTS.red),
    '--dsw-alias-state-success-primary': both(FIXED_ACCENTS.success),
    '--dsw-alias-state-warn-primary': both('#f76707'),
    '--dsw-alias-state-business-primary': both(palette.primary),
    '--dsw-alias-button-info-fill': both(palette.primary),
    '--dsw-alias-button-info-hover': both('#055bb0'),
    '--dsw-specific-sidebar-fill': both('#ffffff'),
    '--dsw-specific-input-major': both('#ffffff'),
  }
}
