import { Axes } from '@nivo/axes'
import { BarCustomLayerProps, BarDatum } from '@nivo/bar'
import { computeXYScalesForSeries } from '@nivo/scales'
import { line } from 'd3-shape'
import { Fragment } from 'react'

import { groupBy } from '@/utils'

export type NumKeysOnly<T> = keyof {
  [K in keyof T as T[K] extends number ? K : never]: never
}

export type CustomLineProps<T extends BarDatum, U extends NumKeysOnly<T>> = {
  xKey: U
  yKey: NumKeysOnly<Omit<T, U>>
  showAxis?: boolean
  color?: string
  customScale?: boolean
}

const CustomLine =
  <T extends BarDatum, U extends NumKeysOnly<T>>(
    customLineProps: CustomLineProps<T, U>[]
  ) =>
  ({
    bars,
    xScale,
    yScale,
    innerHeight,
    innerWidth,
  }: BarCustomLayerProps<T>) => {
    const grouped = groupBy([...bars], ({ data }) => data.id.toString())

    const lines = customLineProps.map((lineProps, index) => {
      let customScale = yScale

      if (lineProps.customScale) {
        const scale = computeXYScalesForSeries(
          [
            {
              id: 'lineScale' + index,
              data: bars.map(({ data }) => ({
                x: data.data[lineProps.xKey] as number,
                y: data.data[lineProps.yKey] as number,
              })),
            },
          ],
          { type: 'linear' },
          { type: 'linear' },
          innerWidth,
          innerHeight
        )

        customScale = scale.yScale
      }

      const lineGenerator = line()
        .x((bar: any) => bar.x + 6)
        .y((bar: any) => {
          return customScale(bar.data.data[lineProps.yKey])!
        })

      return (
        <Fragment key={index}>
          {lineProps.showAxis && (
            <Axes
              yScale={customScale}
              xScale={xScale}
              width={innerWidth}
              height={innerHeight}
              right={{
                tickSize: 0,
                format: (data) => `${data}%`,
              }}
            />
          )}
          <path
            d={lineGenerator(Object.values(grouped)[0] as any) as any}
            fill='none'
            stroke={lineProps.color ?? 'black'}
            strokeWidth={2}
            style={{ pointerEvents: 'none' }}
          />
        </Fragment>
      )
    })

    return lines
  }

export default CustomLine
