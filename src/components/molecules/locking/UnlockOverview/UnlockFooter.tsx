import { Box, TableCell, TableRow, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, toBigNumber } from '@/utils'

type UnlockFooterProps = {
  userLocks: UserLock[]
}

const UnlockFooter: React.FC<UnlockFooterProps> = ({ userLocks }) => {
  const { t } = useTranslation()

  const total = userLocks.reduce((acc, cur) => {
    return acc.add(toBigNumber(cur.lockedAmount))
  }, toBigNumber('0'))

  return (
    <TableRow>
      <TableCell padding='none' colSpan={5}>
        <Box px={2}>
          <Typography
            variant='subtitle2'
            component='span'
            display='block'
            py='6px'
            textTransform='capitalize'
          >
            {t('general.total')}
          </Typography>
          <TokenAmount
            py='6px'
            amount={formatAmount(formatEther(total))}
            symbol='KSU'
          />
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default UnlockFooter
