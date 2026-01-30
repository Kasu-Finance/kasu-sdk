import { Box, BoxProps, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'
import WaveBox from '@/components/atoms/WaveBox'

type SummaryKPICardProps = BoxProps & {
  title: string
  value: string
  unit?: string
  tooltip?: ReactNode
}

const SummaryKPICard: React.FC<SummaryKPICardProps> = ({
  title,
  value,
  unit,
  tooltip,
  ...rest
}) => {
  return (
    <WaveBox
      borderRadius={2}
      height={116}
      py={4}
      px={2}
      display='flex'
      flexDirection='column'
      justifyContent='space-between'
      {...rest}
    >
      <Box display='flex' alignItems='center' gap={0.5}>
        <Typography variant='baseSm' color='gray.extraDark'>
          {title}
        </Typography>
        {tooltip && <ToolTip title={tooltip} />}
      </Box>
      <Box display='flex' alignItems='flex-end' gap={1}>
        <Typography variant='h4' color='primary.main'>
          {value}
        </Typography>
        {unit && (
          <Typography variant='baseMd' color='gray.extraDark' pb={0.25}>
            {unit}
          </Typography>
        )}
      </Box>
    </WaveBox>
  )
}

export default SummaryKPICard
