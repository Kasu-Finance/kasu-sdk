'use client'

import { Box, Typography } from '@mui/material'
import React from 'react'

// Colors from Figma
const GRID_COLOR = '#CDCED0'
const BAR_COLORS = {
  primary: '#A47B4F', // Gold/Extra Dark
  secondary: '#E8C091', // Gold/Middle
  tertiary: '#C4996C', // Gold
}
const LINE_COLORS = {
  dark: '#28282A',
  gold: '#C4996C',
}

type BarData = {
  label: string
  values: number[] // Up to 3 stacked values per bar
  lineValue?: number // Optional line value at this point
  lineValue2?: number // Optional second line value
}

type LegendItem = {
  type: 'bar' | 'line'
  color: string
  label: string
}

type VerticalBarChartProps = {
  title: string
  data: BarData[]
  leftAxisLabel?: string
  rightAxisLabel?: string
  leftAxisValues: string[]
  rightAxisValues?: string[]
  barColors?: string[]
  lineColor?: string
  lineColor2?: string
  legend: LegendItem[]
  hasData: boolean
  maxLeftValue: number
  maxRightValue?: number
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  title,
  data,
  leftAxisValues,
  rightAxisValues,
  barColors = [BAR_COLORS.primary, BAR_COLORS.secondary, BAR_COLORS.tertiary],
  lineColor = LINE_COLORS.dark,
  lineColor2 = LINE_COLORS.gold,
  legend,
  hasData,
  maxLeftValue,
  maxRightValue,
}) => {
  const chartHeight = 196

  // Calculate line points for SVG path
  const getLinePoints = (values: (number | undefined)[], maxValue: number) => {
    const validPoints: string[] = []
    const barWidth = 100 / data.length

    values.forEach((value, index) => {
      if (value !== undefined && value !== null) {
        const x = barWidth * index + barWidth / 2
        const y = 100 - (value / maxValue) * 100
        validPoints.push(`${x},${y}`)
      }
    })

    return validPoints.join(' ')
  }

  return (
    <Box>
      {/* Header with title and line */}
      <Box pt={1} pb={0.5} mb={2}>
        <Box display='flex' alignItems='center' gap={1}>
          <Typography
            sx={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontWeight: 500,
              fontSize: 20,
              lineHeight: 1,
              letterSpacing: '0.02em',
              color: '#28282A',
            }}
          >
            {title}
          </Typography>
          {!hasData && (
            <Typography
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 600,
                fontSize: 10,
                color: '#FF9921',
                bgcolor: 'rgba(255, 153, 33, 0.2)',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
              }}
            >
              N/A
            </Typography>
          )}
        </Box>
        <Box mt={0.5} height={1} bgcolor='#28282A' />
      </Box>

      {/* Chart area */}
      <Box display='flex' gap={1.5}>
        {/* Left Y-axis labels */}
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          height={chartHeight}
          minWidth={65}
        >
          {leftAxisValues.map((label, idx) => (
            <Typography
              key={idx}
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 400,
                fontSize: 12,
                lineHeight: 1.5,
                color: '#28282A',
                textAlign: 'right',
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* Chart content */}
        <Box position='relative' flex={1} height={chartHeight}>
          {/* Grid lines (dashed) */}
          {leftAxisValues.map((_, index) => (
            <Box
              key={index}
              position='absolute'
              top={`${(index / (leftAxisValues.length - 1)) * 100}%`}
              left={0}
              right={0}
              height={0}
              borderTop={`1px dashed ${GRID_COLOR}`}
              zIndex={0}
            />
          ))}

          {/* Bars container */}
          <Box
            position='absolute'
            top={0}
            left={0}
            right={0}
            bottom={0}
            display='flex'
            alignItems='flex-end'
            justifyContent='space-around'
            zIndex={1}
          >
            {data.map((point, index) => {
              // Calculate bar heights as percentage of chart
              const heights = point.values.map((v) => (v / maxLeftValue) * 100)

              return (
                <Box
                  key={index}
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  width={`${80 / data.length}%`}
                  maxWidth={20}
                >
                  {/* Stacked bars (rendered bottom to top) */}
                  <Box
                    display='flex'
                    flexDirection='column-reverse'
                    width='100%'
                  >
                    {heights.map((height, barIdx) => (
                      <Box
                        key={barIdx}
                        sx={{
                          height: `${height * (chartHeight / 100)}px`,
                          bgcolor: barColors[barIdx] || BAR_COLORS.primary,
                          borderRadius:
                            barIdx === heights.length - 1 ? '2px 2px 0 0' : 0,
                          minHeight: height > 0 ? 1 : 0,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Box>

          {/* Line overlays using SVG */}
          {maxRightValue && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2,
              }}
              viewBox='0 0 100 100'
              preserveAspectRatio='none'
            >
              {/* First line */}
              <polyline
                points={getLinePoints(
                  data.map((d) => d.lineValue),
                  maxRightValue
                )}
                fill='none'
                stroke={lineColor}
                strokeWidth='1.5'
                vectorEffect='non-scaling-stroke'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              {/* Second line */}
              <polyline
                points={getLinePoints(
                  data.map((d) => d.lineValue2),
                  maxRightValue
                )}
                fill='none'
                stroke={lineColor2}
                strokeWidth='1.5'
                vectorEffect='non-scaling-stroke'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}
        </Box>

        {/* Right Y-axis labels */}
        {rightAxisValues && (
          <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
            height={chartHeight}
            minWidth={40}
          >
            {rightAxisValues.map((label, idx) => (
              <Typography
                key={idx}
                sx={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: '#28282A',
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* X-axis labels (Borrower numbers) */}
      <Box display='flex' mt={0.5} pl={9} pr={rightAxisValues ? 5 : 0}>
        <Box display='flex' justifyContent='space-around' flex={1}>
          {data.map((point, index) => (
            <Typography
              key={index}
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 400,
                fontSize: 10,
                lineHeight: 1.5,
                color: '#28282A',
                width: `${100 / data.length}%`,
                textAlign: 'center',
              }}
            >
              {point.label}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* X-axis title */}
      <Typography
        sx={{
          fontFamily: '"Open Sans", sans-serif',
          fontWeight: 400,
          fontSize: 10,
          color: '#6B6F76',
          mt: 0.5,
          pl: 9,
        }}
      >
        Customer:
      </Typography>

      {/* Legend */}
      <Box display='flex' gap={2} mt={2} flexWrap='wrap'>
        {legend.map((item, idx) => (
          <Box key={idx} display='flex' alignItems='center' gap={0.5}>
            <Box
              width={item.type === 'bar' ? 16 : 20}
              height={item.type === 'bar' ? 10 : 2}
              borderRadius={item.type === 'bar' ? 0.5 : 1}
              bgcolor={item.color}
            />
            <Typography
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 400,
                fontSize: 10,
                lineHeight: 1.5,
                color: '#28282A',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default VerticalBarChart
