import { BarCustomLayerProps } from '@nivo/bar'

import { computeGridLines } from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/BarLineChart/compute'

const CustomGrid =
  (color: string = 'rgba(205, 206, 208, 1)') =>
  <T,>(data: BarCustomLayerProps<T>) => {
    const computed = computeGridLines({
      axis: 'y',
      height: data.innerHeight,
      width: data.innerWidth,
      scale: data.yScale,
    })

    return computed.map((compute) => (
      <line
        key={compute.key}
        stroke={color}
        strokeWidth={2}
        x1={compute.x1 + 16}
        x2={compute.x2 - 16}
        y1={compute.y1}
        y2={compute.y2}
        strokeDasharray='0, 4'
        strokeLinecap='round'
      />
    ))
  }

export default CustomGrid
