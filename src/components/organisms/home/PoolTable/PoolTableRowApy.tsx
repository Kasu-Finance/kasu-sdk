import { Box, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

type PoolTableRowApyProps = {
  title: string
  apy: string
  icon: ReactNode
}

const PoolTableRowApy: React.FC<PoolTableRowApyProps> = ({
  apy,
  icon,
  title,
}) => (
  <Box display='flex' alignItems='center' gap={0.5} title={title}>
    {icon}
    <Typography variant='baseSm'>{apy}</Typography>
  </Box>
)

export default PoolTableRowApy
