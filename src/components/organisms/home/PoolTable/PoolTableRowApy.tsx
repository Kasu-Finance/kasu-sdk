import { Box, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

import { formatPercentage } from '@/utils'

type PoolTableRowApyProps = {
  title: string
  minApy: string
  maxApy: string
  icon: ReactNode
}

const PoolTableRowApy: React.FC<PoolTableRowApyProps> = ({
  minApy,
  maxApy,
  icon,
  title,
}) => (
  <Box display='flex' alignItems='center' gap={0.5} title={title}>
    {icon}
    <Typography variant='baseSm'>
      {formatPercentage(minApy).replaceAll(' %', '')} -{' '}
      {formatPercentage(maxApy).replaceAll(' ', '')}
    </Typography>
  </Box>
)

export default PoolTableRowApy
