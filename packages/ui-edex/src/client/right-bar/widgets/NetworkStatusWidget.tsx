/**
 * NETWORK STATUS widget (the reference's compact icon stat tiles, matched to
 * the `network-status` slot): a 2×2 grid of pale-blue icon tiles with bold
 * dark values and muted labels — down/up throughput, link state, ping —
 * fed by the live network snapshot.
 */
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './NetworkStatusWidget.module.css'

/** Tiny inline glyph tiles (the reference's icon squares, pale blue). */
function Glyph({ kind }: { kind: 'down' | 'up' | 'link' | 'ping' }) {
  if (kind === 'down') {
    return (
      <svg viewBox="0 0 16 16" className={css.glyphSvg} aria-hidden="true">
        <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'up') {
    return (
      <svg viewBox="0 0 16 16" className={css.glyphSvg} aria-hidden="true">
        <path d="M8 14V5M4.5 8.5 8 5l3.5 3.5M3 2.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'link') {
    return (
      <svg viewBox="0 0 16 16" className={css.glyphSvg} aria-hidden="true">
        <rect x="2" y="6.5" width="5" height="3" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="6.5" width="5" height="3" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 8h2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className={css.glyphSvg} aria-hidden="true">
      <path d="M2 10.5c2-4 4-4 6 0s4 4 6 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Network status: compact icon stat tiles in the reference's tile style. */
export function NetworkStatusWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  const tiles = [
    { kind: 'down' as const, value: network.downMbs.toFixed(2), unit: 'MB/S', label: 'DOWN' },
    { kind: 'up' as const, value: network.upMbs.toFixed(2), unit: 'MB/S', label: 'UP' },
    { kind: 'link' as const, value: network.network.state, unit: '', label: network.network.interfaceName },
    {
      kind: 'ping' as const,
      value: network.network.pingMs === null ? '—' : network.network.pingMs.toFixed(0),
      unit: network.network.pingMs === null ? '' : 'MS',
      label: 'PING',
    },
  ]
  return (
    <div className={css.grid}>
      {tiles.map(tile => (
        <div key={tile.label} className={css.tile}>
          <span className={css.glyphBox}>
            <Glyph kind={tile.kind} />
          </span>
          <span className={css.tileText}>
            <span className={css.tileValue}>
              {tile.value}
              {tile.unit !== '' && <span className={css.tileUnit}> {tile.unit}</span>}
            </span>
            <span className={css.tileLabel}>{tile.label}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
