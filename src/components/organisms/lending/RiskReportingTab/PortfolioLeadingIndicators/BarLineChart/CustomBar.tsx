import { BarCustomLayerProps, BarDatum } from '@nivo/bar'
import { Margin } from '@nivo/core'
import { useTooltip } from '@nivo/tooltip'
import { Fragment } from 'react'

const CustomBar =
  <T extends BarDatum>(
    margin: Margin,
    renderTooltip?: (data: T) => JSX.Element
  ) =>
  ({ borderRadius, bars }: BarCustomLayerProps<T>) => {
    // eslint-disable-next-line
    const { hideTooltip, showTooltipAt } = useTooltip()

    return bars.map((bar, index) => (
      <Fragment key={index}>
        <rect
          width={bar.width}
          height={bar.height}
          rx={borderRadius}
          fill={bar.color}
          x={bar.x}
          y={bar.y}
        />
        {renderTooltip && (
          <rect
            width={bar.width}
            height='100%'
            fill='transparent'
            x={bar.x}
            onMouseEnter={() => {
              showTooltipAt(
                renderTooltip(bar.data.data),
                [bar.x + 6 + margin.left, bar.y + margin.top],
                'top'
              )
            }}
            onMouseLeave={hideTooltip}
          />
        )}
      </Fragment>
    ))
  }

export default CustomBar
