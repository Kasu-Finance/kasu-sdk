'use client'

import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { Margin } from '@nivo/core'

import CustomBar from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/BarLineChart/CustomBar'
import CustomGrid from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/BarLineChart/CustomGrid'
import CustomLine, {
  CustomLineProps,
} from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/BarLineChart/CustomLine'

import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

// make sure value of given object key is of type number
type NumKeysOnly<T> = keyof {
  [K in keyof T as T[K] extends number ? K : never]: never
}

type BarLineChartProps<
  T extends BarDatum,
  U extends NumKeysOnly<T>,
  K extends keyof T,
> = {
  keys: K[]
  colors: string[]
  data: T[]
  lines?: CustomLineProps<T, U>[]
  margin: Margin
  padding?: number
  renderTooltip?: (data: T) => JSX.Element
}

const font = {
  fontFamily: customTypography.baseSm.fontFamily,
  fontSize: customTypography.baseSm.fontSize,
  fontWeight: customTypography.baseSm.fontWeight,
  lineHeight: customTypography.baseSm.lineHeight,
}

const BarLineChart = <
  T extends BarDatum,
  U extends NumKeysOnly<T>,
  K extends keyof T,
>({
  keys,
  data,
  lines,
  colors,
  margin,
  padding,
  renderTooltip,
}: BarLineChartProps<T, U, K>) => {
  // get line keys that follows the existing scale
  const lineKeys = lines
    ? lines.filter((line) => !line.customScale).map((line) => line.yKey)
    : []

  // manually get the largest number for both bars and lines
  const maxData = data.reduce(
    (largest, curData) =>
      Math.max(
        largest,
        ...(lineKeys.map((key) => curData[key]) as number[]),
        ...(keys.map((key) => curData[key]) as number[])
      ),
    0
  )

  return (
    <ResponsiveBar
      theme={{
        legends: {
          text: font,
        },
        axis: {
          ticks: {
            text: font,
          },
        },
      }}
      data={data}
      keys={keys as string[]}
      padding={padding}
      groupMode='grouped'
      margin={margin}
      axisLeft={{
        format: (data) => formatAmount(data),
        tickSize: 0,
      }}
      legends={[
        {
          data: [{ label: 'Accounting Firms:', id: 0 }],
          symbolSize: 0,
          anchor: 'bottom-left',
          dataFrom: 'keys',
          itemHeight: 19,
          itemWidth: margin.left,
          direction: 'column',
          translateX: -105,
          translateY: 32,
        },
      ]}
      valueScale={{
        type: 'linear',
        max: maxData,
      }}
      axisBottom={{
        tickSize: 0,
        tickPadding: 15,
      }}
      colors={colors}
      indexBy='x'
      enableLabel={false}
      borderRadius={3}
      layers={[
        CustomGrid(),
        'axes',
        CustomBar(margin, renderTooltip),
        ...(lines ? [CustomLine(lines)] : []),
        'legends',
      ]}
    />
  )
}

export default BarLineChart
