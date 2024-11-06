import type { Line as Nivoline } from '@nivo/axes'
import {
  AnyScale,
  centerScale,
  getScaleTicks,
  ScaleValue,
  TicksSpec,
} from '@nivo/scales'

export const computeGridLines = <Value extends ScaleValue>({
  width,
  height,
  scale,
  axis,
  values: _values,
}: {
  width: number
  height: number
  scale: AnyScale
  axis: 'x' | 'y'
  values?: TicksSpec<Value>
}) => {
  const lineValues = Array.isArray(_values) ? _values : undefined
  const values = lineValues || getScaleTicks<Value>(scale, _values)
  const position = 'bandwidth' in scale ? centerScale(scale) : scale

  const lines: Nivoline[] =
    axis === 'x'
      ? values.map((value: Value) => ({
          key: value instanceof Date ? `${value.valueOf()}` : `${value}`,
          x1: position(value) ?? 0,
          x2: position(value) ?? 0,
          y1: 0,
          y2: height,
        }))
      : values.map((value: Value) => ({
          key: value instanceof Date ? `${value.valueOf()}` : `${value}`,
          x1: 0,
          x2: width,
          y1: position(value) ?? 0,
          y2: position(value) ?? 0,
        }))

  return lines
}
