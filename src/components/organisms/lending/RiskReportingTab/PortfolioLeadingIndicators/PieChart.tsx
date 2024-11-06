'use client'

import { Box, Paper, Skeleton, Typography } from '@mui/material'
import { DefaultRawDatum, ResponsivePie } from '@nivo/pie'
import React, { useEffect, useState } from 'react'

type PieChartProps = {
  data: (DefaultRawDatum & {
    color: string
    label: string
  })[]
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<PieChartProps['data']>([])

  // animate chart https://github.com/plouc/nivo/issues/732
  useEffect(() => {
    const animation = setTimeout(() => setChartData(data), 1)

    return () => {
      clearTimeout(animation)
    }
  }, [data])

  return (
    <>
      <ResponsivePie
        data={chartData}
        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        innerRadius={0.45}
        padAngle={1}
        cornerRadius={4}
        activeOuterRadiusOffset={5}
        enableArcLinkLabels={false}
        enableArcLabels={false}
        colors={({ data }) => data.color}
        tooltip={({ datum }) => (
          <Paper sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <Box
              boxShadow='0 0 15px 0 rgba(0,0,0, 0.5)'
              bgcolor={datum.color}
              width={12}
              height={12}
              mr={1}
            />
            <Typography variant='baseSm'>{datum.label} :&nbsp;</Typography>
            <Typography variant='baseSmBold'>{datum.value}</Typography>
          </Paper>
        )}
        transitionMode='startAngle'
      />
      {!chartData.length && data.length && (
        <Skeleton
          variant='circular'
          width={210}
          height={210}
          sx={{
            position: 'absolute',
            top: 5,
            left: 5,
            zIndex: 1,
          }}
        />
      )}
    </>
  )
}

export default PieChart
