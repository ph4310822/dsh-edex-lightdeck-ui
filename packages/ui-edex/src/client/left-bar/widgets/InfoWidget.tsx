/**
 * TOTAL USERS widget (the reference's KPI + sparkline card, matched to the
 * `info` slot): a big dark-navy KPI with a semantic delta badge, a blue
 * sparkline over a dashed gray comparison line, and a muted memory caption —
 * all fed by the live panel telemetry.
 */
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './InfoWidget.module.css'

/** Overall (mean-across-cores) CPU history — the card's sparkline series. */
function overallHistory(history: readonly (readonly number[])[]): number[] {
  const cores = history.length
  if (cores === 0) return []
  const length = Math.min(...history.map(series => series.length))
  const series: number[] = []
  for (let index = 0; index < length; index += 1) {
    let sum = 0
    for (const core of history) sum += core[index] ?? 0
    series.push(sum / cores)
  }
  return series
}

/** Total Users: KPI + delta + sparkline over the live load history. */
export function InfoWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  const series = overallHistory(panel.cpuHistory)
  const kpi = panel.tasks
  const mean = series.length > 0 ? series.reduce((a, b) => a + b, 0) / series.length : 0
  const first = series[0] ?? 0
  const last = series[series.length - 1] ?? 0
  const deltaPct = series.length > 1 && mean > 0 ? ((last - first) / Math.max(mean, 1)) * 100 : 0
  const deltaUp = deltaPct >= 0
  const width = 168
  const height = 44
  const max = Math.max(1, ...series)
  const points = series
    .map((value, index) => {
      const x = series.length <= 1 ? 0 : (index / (series.length - 1)) * width
      const y = height - (value / max) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const meanY = height - (mean / max) * (height - 4) - 2
  return (
    <div className={css.card}>
      <div className={css.kpiRow}>
        <span className={css.kpi}>{kpi.toLocaleString('en-US')}</span>
        <span className={deltaUp ? css.deltaUp : css.deltaDown}>
          {deltaUp ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(1)}%
        </span>
      </div>
      <svg className={css.spark} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1={meanY.toFixed(1)} x2={String(width)} y2={meanY.toFixed(1)} className={css.comparison} />
        {points !== '' && <polyline points={points} className={css.line} />}
      </svg>
      <div className={css.caption}>
        <span>MEMORY</span>
        <span className={css.captionValue}>
          {panel.memoryUsedGiB.toFixed(1)} / {panel.memoryTotalGiB.toFixed(1)} GiB
        </span>
      </div>
    </div>
  )
}
