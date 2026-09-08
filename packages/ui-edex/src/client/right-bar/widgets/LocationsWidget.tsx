/**
 * LOCATIONS widget (the reference's world-map choropleth card — the
 * world-view counterpart that replaces the `globe` slot): a dotted world map
 * where blue intensity encodes sample activity by region, plus the region
 * list with mini progress bars. Static sample activity (the eDEX hooks carry
 * no geo data — documented divergence); the map geometry is rendered as a
 * dot raster from coarse continent outlines.
 */
import { useMemo } from 'react'
import css from './LocationsWidget.module.css'

/** Coarse continent outlines (lon/lat) — enough fidelity for a dot raster. */
const CONTINENTS: readonly (readonly (readonly [number, number])[])[] = [
  // North America
  [[-168, 66], [-166, 60], [-150, 60], [-130, 55], [-125, 49], [-120, 35], [-110, 23], [-97, 16], [-90, 15], [-83, 9], [-81, 25], [-75, 35], [-70, 42], [-65, 45], [-52, 47], [-60, 55], [-65, 60], [-75, 62], [-80, 70], [-110, 70], [-130, 70], [-155, 71]],
  // Greenland
  [[-45, 60], [-25, 70], [-20, 78], [-35, 83], [-55, 82], [-60, 75], [-50, 65]],
  // South America
  [[-78, 7], [-70, 0], [-75, -15], [-72, -30], [-70, -45], [-68, -55], [-70, -52], [-65, -40], [-58, -34], [-48, -25], [-35, -8], [-42, -2], [-50, 0], [-60, 5]],
  // Europe
  [[-9, 36], [-9, 44], [-4, 48], [2, 51], [7, 54], [5, 58], [10, 64], [18, 70], [30, 71], [40, 66], [38, 55], [28, 56], [22, 50], [15, 46], [18, 40], [12, 38], [5, 36], [-6, 36]],
  // Africa
  [[-17, 15], [-17, 21], [-10, 30], [-5, 35], [10, 37], [20, 33], [32, 31], [35, 27], [43, 11], [51, 12], [48, 5], [42, -2], [40, -15], [35, -24], [32, -29], [25, -34], [18, -33], [14, -22], [12, -8], [9, -1], [8, 4], [-5, 5], [-8, 4], [-13, 8]],
  // Asia
  [[40, 66], [60, 72], [90, 74], [110, 74], [130, 70], [150, 68], [170, 66], [178, 64], [165, 60], [158, 53], [142, 48], [135, 42], [128, 35], [120, 28], [112, 20], [108, 12], [103, 6], [98, 10], [95, 16], [90, 22], [86, 18], [82, 10], [78, 6], [74, 10], [70, 18], [66, 24], [58, 26], [55, 22], [52, 16], [45, 12], [42, 16], [38, 24], [35, 30], [40, 38], [44, 44], [50, 48], [48, 54], [42, 58]],
  // Australia
  [[114, -22], [114, -32], [118, -35], [125, -33], [132, -32], [137, -35], [141, -38], [147, -38], [150, -35], [153, -28], [150, -22], [146, -18], [142, -12], [138, -14], [135, -12], [130, -12], [126, -14], [120, -18]],
]

/** Sample activity hotspots (lon, lat, weight) — drives the blue intensity. */
const HOTSPOTS: readonly { lon: number; lat: number; weight: number }[] = [
  { lon: -118, lat: 34, weight: 1 },
  { lon: -74, lat: 41, weight: 1 },
  { lon: -99, lat: 19, weight: 0.5 },
  { lon: -46, lat: -23, weight: 0.5 },
  { lon: 2, lat: 48, weight: 0.9 },
  { lon: 37, lat: 55, weight: 0.8 },
  { lon: 78, lat: 28, weight: 0.6 },
  { lon: 103, lat: 1, weight: 0.9 },
  { lon: 139, lat: 35, weight: 0.8 },
  { lon: 151, lat: -33, weight: 0.7 },
]

/** The analyzed accent's blue intensity ramp (tints of #066fd1). */
const INTENSITY_HIGH = '#066fd1'
const INTENSITY_MID = '#5c9be0'
const INTENSITY_LOW = '#c7dbf5'

function pointInPolygon(lon: number, lat: number, polygon: readonly (readonly [number, number])[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    const intersects = (yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

function isLand(lon: number, lat: number): boolean {
  return CONTINENTS.some(polygon => pointInPolygon(lon, lat, polygon))
}

function intensityAt(lon: number, lat: number): number {
  let intensity = 0
  for (const spot of HOTSPOTS) {
    const dLon = lon - spot.lon
    const dLat = lat - spot.lat
    const d2 = dLon * dLon + dLat * dLat
    intensity = Math.max(intensity, spot.weight * Math.exp(-d2 / (2 * 22 * 22)))
  }
  return intensity
}

const VIEW_W = 360
const VIEW_H = 152

/** One rendered map dot. */
interface Dot { lon: number; lat: number; fill: string }

/** The reference's Locations card: dot-map choropleth + region list. */
export function LocationsWidget() {
  const dots = useMemo<Dot[]>(() => {
    const result: Dot[] = []
    for (let lat = 74; lat >= -56; lat -= 3.6) {
      for (let lon = -180; lon <= 180; lon += 3.6) {
        if (!isLand(lon, lat)) continue
        const intensity = intensityAt(lon, lat)
        const fill = intensity > 0.55 ? INTENSITY_HIGH : intensity > 0.22 ? INTENSITY_MID : INTENSITY_LOW
        result.push({ lon, lat, fill })
      }
    }
    return result
  }, [])
  const regions = [
    { name: 'US', pct: 42 },
    { name: 'EUROPE', pct: 26 },
    { name: 'APAC', pct: 19 },
    { name: 'OTHER', pct: 13 },
  ]
  const toX = (lon: number): number => lon + 180
  const toY = (lat: number): number => ((75 - lat) * VIEW_H) / 135
  return (
    <div className={css.card} data-testid="edex-locations-map">
      <svg className={css.map} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {dots.map((dot, index) => (
          <circle key={index} cx={toX(dot.lon).toFixed(1)} cy={toY(dot.lat).toFixed(1)} r="1.7" fill={dot.fill} />
        ))}
      </svg>
      <div className={css.regions}>
        {regions.map(region => (
          <div key={region.name} className={css.region}>
            <span className={css.regionName}>{region.name}</span>
            <span className={css.regionBarTrack}>
              <span className={css.regionBarFill} style={{ width: `${region.pct}%` }} />
            </span>
            <span className={css.regionPct}>{region.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
