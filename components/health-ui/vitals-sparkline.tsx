"use client"

import React from "react"

export interface SparklinePoint {
  value?: number
  systolic?: number
  diastolic?: number
}

interface VitalsSparklineProps {
  id: string
  points: SparklinePoint[]
  color: string
  multi?: boolean
}

/**
 * Compact 40x16px inline SVG sparkline of up to 14 entries with thin lines and no axes.
 */
export function VitalsSparkline({ id, points, color, multi = false }: VitalsSparklineProps) {
  const slice = points.slice(-14)
  if (slice.length === 0) return null

  const width = 40
  const height = 16
  const padX = 1.5
  const padY = 2
  const innerW = width - padX * 2
  const innerH = height - padY * 2

  if (multi) {
    const valid = slice.filter(
      (p) => typeof p.systolic === "number" && p.systolic > 0 && typeof p.diastolic === "number" && p.diastolic > 0
    )
    if (valid.length === 0) return null

    const allVals = valid.flatMap((p) => [p.systolic as number, p.diastolic as number])
    const minV = Math.min(...allVals)
    const maxV = Math.max(...allVals)
    const span = Math.max(1, maxV - minV)

    const toX = (i: number) =>
      valid.length === 1 ? width / 2 : padX + (i / (valid.length - 1)) * innerW
    const toY = (v: number) => padY + innerH - ((v - minV) / span) * innerH

    if (valid.length === 1) {
      const ySys = toY(valid[0].systolic!)
      const yDia = toY(valid[0].diastolic!)
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible" aria-hidden="true">
          <line x1={padX} y1={ySys} x2={width - padX} y2={ySys} stroke="#ef4444" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 1.5" />
          <line x1={padX} y1={yDia} x2={width - padX} y2={yDia} stroke="#3b82f6" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 1.5" />
          <circle cx={width - padX - 1} cy={ySys} r={1.5} fill="#ef4444" />
          <circle cx={width - padX - 1} cy={yDia} r={1.5} fill="#3b82f6" />
        </svg>
      )
    }

    const sysPts = valid.map((p, i) => `${toX(i).toFixed(1)},${toY(p.systolic!).toFixed(1)}`).join(" ")
    const diaPts = valid.map((p, i) => `${toX(i).toFixed(1)},${toY(p.diastolic!).toFixed(1)}`).join(" ")
    const lastIdx = valid.length - 1

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible" aria-hidden="true">
        <polyline fill="none" stroke="#ef4444" strokeWidth={1.15} strokeLinecap="round" strokeLinejoin="round" points={sysPts} />
        <polyline fill="none" stroke="#3b82f6" strokeWidth={1.15} strokeLinecap="round" strokeLinejoin="round" points={diaPts} />
        <circle cx={toX(lastIdx)} cy={toY(valid[lastIdx].systolic!)} r={1.4} fill="#ef4444" />
        <circle cx={toX(lastIdx)} cy={toY(valid[lastIdx].diastolic!)} r={1.4} fill="#3b82f6" />
      </svg>
    )
  }

  const valid = slice.filter((p) => typeof p.value === "number" && Number.isFinite(p.value))
  if (valid.length === 0) return null

  const vals = valid.map((p) => p.value as number)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const span = maxV === minV ? 1 : maxV - minV

  const toX = (i: number) =>
    valid.length === 1 ? width / 2 : padX + (i / (valid.length - 1)) * innerW
  const toY = (v: number) =>
    maxV === minV ? height / 2 : padY + innerH - ((v - minV) / span) * innerH

  if (valid.length === 1) {
    const y = height / 2
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible" aria-hidden="true">
        <line x1={padX} y1={y} x2={width - padX} y2={y} stroke={color} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 1.5" />
        <circle cx={width - padX - 1} cy={y} r={1.5} fill={color} />
      </svg>
    )
  }

  const lineCoords = valid.map((p, i) => ({ x: toX(i), y: toY(p.value!) }))
  const polyPoints = lineCoords.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ")
  const areaPath = `M ${lineCoords[0].x.toFixed(1)} ${(height - 1).toFixed(1)} L ${lineCoords
    .map((pt) => `${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" L ")} L ${lineCoords[lineCoords.length - 1].x.toFixed(1)} ${(height - 1).toFixed(1)} Z`
  const gradId = `spark-grad-${id}`
  const last = lineCoords[lineCoords.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" points={polyPoints} />
      <circle cx={last.x} cy={last.y} r={1.5} fill={color} />
    </svg>
  )
}
