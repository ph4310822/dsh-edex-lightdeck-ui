/**
 * TRAFFIC SUMMARY widget (the reference's stacked bar chart card, matched to
 * the `traffic` slot): grouped blue/green vertical bars over dashed
 * gridlines — up/down throughput history from the live network snapshot —
 * sized by ResizeObserver to the bar's leftover height.
 */
import { useEffect, useRef, useState } from 'react'
import type { RightWidgetHooks } from '../../widgets/types.ts'
import css from './TrafficWidget.module.css'

/** Stacked up/down throughput bars with dashed gridlines. The height is
 *  dynamic: the section flex-fills the bar's leftover space (screen − bottom
 *  panel − network status − map), and a ResizeObserver sizes the SVG viewBox
 *  to match the box 1:1, so bars render cleanly at any size. */
function TrafficChart({ up, down }: { up: readonly number[]; down: readonly number[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ w: 316, h: 160 })

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return
    const measure = (): void => {
      const rect = host.getBoundingClientRect()
      setSize({ w: Math.max(80, Math.floor(rect.width)), h: Math.max(48, Math.floor(rect.height)) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    return () => { ro.disconnect() }
  }, [])

  const { w, h } = size
  const count = Math.max(up.length, down.length, 8)
  const max = Math.max(0.5, ...up, ...down) * 1.15
  const baseline = h - 12
  const slot = w / count
  const barW = Math.max(3, Math.min(10, slot * 0.34))
  const gridLines = [0.25, 0.5, 0.75, 1].map(ratio => baseline - ratio * (baseline - 8))
  return (
    <div className={css.trafficChart} ref={hostRef}>
      <svg className={css.traffic} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {gridLines.map((y, index) => (
          <line key={index} x1="0" y1={y.toFixed(1)} x2={String(w)} y2={y.toFixed(1)} className={css.gridLine} />
        ))}
        {Array.from({ length: count }, (_, index) => {
          const cx = slot * index + slot / 2
          const dValue = down[index] ?? 0
          const uValue = up[index] ?? 0
          const dHeight = (dValue / max) * (baseline - 8)
          const uHeight = (uValue / max) * (baseline - 8)
          const isUp = index % 2 === 0
          const barHeight = isUp ? uHeight : dHeight
          return (
            <rect
              key={index}
              x={(cx - barW / 2).toFixed(1)}
              y={(baseline - barHeight).toFixed(1)}
              width={barW.toFixed(1)}
              height={barHeight.toFixed(1)}
              className={isUp ? css.barUp : css.barDown}
            />
          )
        })}
        <line x1="0" y1={String(baseline)} x2={String(w)} y2={String(baseline)} className={css.axis} />
      </svg>
      <div className={css.legendRow}>
        <span className={css.legendItem}><span className={css.swatchUp} /> UP</span>
        <span className={css.legendItem}><span className={css.swatchDown} /> DOWN</span>
      </div>
    </div>
  )
}

/** Traffic widget: legend header + stacked bars over live rx/tx history. */
export function TrafficWidget({ useNetwork }: RightWidgetHooks) {
  const network = useNetwork(s => s)
  return (
    <TrafficChart up={network.upHistory} down={network.downHistory} />
  )
}
