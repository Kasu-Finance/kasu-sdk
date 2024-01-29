import { Box, Typography, useTheme } from '@mui/material'
import React from 'react'

import useStakedKSU from '@/hooks/locking/useStakedKSU'

import ColoredBox from '@/components/atoms/ColoredBox'

type LockModalOverviewProps = {
  balance: string
}

const LockModalOverview: React.FC<LockModalOverviewProps> = ({ balance }) => {
  const theme = useTheme()

  const { stakedKSU } = useStakedKSU()

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        Overview
      </Typography>
      <ColoredBox
        mt={1}
        display='grid'
        gridTemplateColumns='repeat(2, minmax(0, 1fr))'
      >
        <Box
          p={theme.spacing('2px', 2)}
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          gap='12px'
        >
          <Typography
            variant='subtitle2'
            component='span'
            color='text.secondary'
            display='block'
          >
            Wallet Balance
          </Typography>
          <Typography variant='body2' component='span' display='block'>
            {balance} KSU
          </Typography>
        </Box>
        <Box
          p={theme.spacing('2px', 2)}
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
        >
          <Typography
            variant='subtitle2'
            component='span'
            color='text.secondary'
            display='block'
          >
            Total KSU locked
          </Typography>
          <Typography variant='body2' component='span' display='block'>
            {stakedKSU?.toString()} KSU
          </Typography>
        </Box>
      </ColoredBox>
    </Box>
  )
}

export default LockModalOverview
