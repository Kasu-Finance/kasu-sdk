import { TableCell, TableRow, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
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
        <ColoredBox
          sx={(theme) => ({
            px: 2,
            [theme.breakpoints.up('sm')]: {
              background: 'unset',
            },
            [theme.breakpoints.down('sm')]: {
              px: 1,
            },
          })}
        >
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
            amount={formatAmount(formatEther(total) || '0')}
            symbol='KSU'
          />
        </ColoredBox>
      </TableCell>
    </TableRow>
  )
}

export default UnlockFooter
