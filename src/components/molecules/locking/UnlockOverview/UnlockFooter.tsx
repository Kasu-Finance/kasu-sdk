import { Box, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { UserLock } from 'kasu-sdk/src/types'
import React from 'react'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, toBigNumber } from '@/utils'

type UnlockFooterProps = {
  userLocks: UserLock[]
}

const UnlockFooter: React.FC<UnlockFooterProps> = ({ userLocks }) => {
  const total = userLocks.reduce((acc, cur) => {
    return acc.add(toBigNumber(cur.lockedAmount))
  }, toBigNumber('0'))

  return (
    <Box px={2}>
      <Typography variant='subtitle2' component='span' display='block' py='6px'>
        Total
      </Typography>
      <Box py='6px'>
        <TokenAmount amount={formatAmount(formatEther(total))} symbol='KSU' />
      </Box>
    </Box>
  )
}

export default UnlockFooter
