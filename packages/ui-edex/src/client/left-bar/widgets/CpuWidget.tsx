/**
 * ACTIVE USERS widget (the reference's KPI + donut-gauge card, matched to the
 * `cpu` slot): a big dark-navy KPI with a semantic delta badge and a large
 * radial gauge — blue arc on a #dce1e7 track — driven by the live overall
 * CPU utilization.
 */
import type { LeftWidgetHooks } from '../../widgets/types.ts'
import css from './CpuWidget.module.css'

/** Overall (mean-across-cores) busy percentage. */
function overallBusy(busy: readonly number[]): number {
  if (busy.length === 0) return 0
  return busy.reduce((a, b) => a + b, 0) / busy.length
}

/** Radial gauge: blue progress arc over a gray track, value label centered. */
function Donut({ pct, size = 112, stroke = 12 }: { pct: number; size?: number; stroke?: number }) {
  const clamped = Math.min(100, Math.max(0, pct))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (clamped / 100) * circumference
  const center = size / 2
  return (
    <svg className={css.donut} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(clamped)} percent`}>
      <circle cx={center} cy={center} r={radius} className={css.track} strokeWidth={stroke} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        className={css.arc}
        strokeWidth={stroke}
        strokeDasharray={`${filled.toFixed(2)} ${(circumference - filled).toFixed(2)}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text x={center} y={center} className={css.donutValue} dominantBaseline="central" textAnchor="middle">
        {Math.round(clamped)}%
      </text>
    </svg>
  )
}

/** Active Users: KPI + delta + donut gauge over live CPU utilization. */
export function CpuWidget({ usePanel }: LeftWidgetHooks) {
  const panel = usePanel(s => s)
  const busy = overallBusy(panel.cpuBusy)
  const history = panel.cpuHistory
  const cores = history.length
  const length = cores > 0 ? Math.min(...history.map(series => series.length)) : 0
  const series: number[] = []
  for (let index = 0; index < length; index += 1) {
    let sum = 0
    for (const core of history) sum += core[index] ?? 0
    series.push(sum / cores)
  }
  const first = series[0] ?? 0
  const last = series[series.length - 1] ?? 0
  const delta = series.length > 1 ? last - first : 0
  const deltaUp = delta >= 0
  return (
    <div className={css.card}>
      <div className={css.kpiRow}>
        <span className={css.kpi}>{busy.toFixed(1)}%</span>
        <span className={deltaUp ? css.deltaUp : css.deltaDown}>
          {deltaUp ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
        </span>
      </div>
      <Donut pct={busy} />
      <div className={css.captionRow}>
        <span>MIN {Math.round(panel.cpuMin)}%</span>
        <span>MAX {Math.round(panel.cpuMax)}%</span>
        <span>TASKS {panel.tasks}</span>
      </div>
    </div>
  )
}
