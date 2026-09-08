/** `settings.edex` namespace dictionaries (the Theme Color row's copy). */

/** Dictionary namespace owned by the eDEX shell plugin. */
export const NS = 'settings.edex'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'edex.themeColor': '主题色',
  'edex.custom': '自定义',
  'edex.preset.analyzed': '仪表盘蓝',
  'edex.preset.amber': '信号绿',
  'edex.preset.cyan': '警示红',
  'edex.preset.violet': '海军蓝',
  'edex.preset.blue': '石板灰',
} satisfies Record<string, string>

/** The settings.edex namespace key union. */
export type EdexThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'edex.themeColor': 'Theme Color',
  'edex.custom': 'Custom',
  'edex.preset.analyzed': 'Dashboard Blue',
  'edex.preset.amber': 'Signal Green',
  'edex.preset.cyan': 'Alert Red',
  'edex.preset.violet': 'Navy',
  'edex.preset.blue': 'Slate',
} satisfies Record<EdexThemeKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The eDEX Theme Color settings row's copy. */
    'settings.edex': EdexThemeKey
  }
}
