import { Box, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { useWeb3React } from '@web3-react/core'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useRatio from '@/hooks/useRatio'
import useTranslation from '@/hooks/useTranslation'

import List from '@/components/atoms/List'

import { formatAccount, formatAmount, toBigNumber } from '@/utils'

type UnlockModalCompletedProps = {
  userLock: UserLock
}

const UnlockModalCompleted: React.FC<UnlockModalCompletedProps> = ({
  userLock,
}) => {
  const { t } = useTranslation()

  const { amount } = useLockModalState()

  const { account } = useWeb3React()

  const isPartial = !toBigNumber(amount).eq(toBigNumber(userLock.lockedAmount))

  const ratio = useRatio(amount, userLock.lockedAmount)

  return (
    <Box p={1}>
      {isPartial ? (
        <>
          <Typography variant='body1' component='p'>
            {t('modals.unlock.completed.description-1')}
          </Typography>
          <List>
            <li>
              <Typography variant='body1' component='p'>
                <Typography variant='h6' component='span'>
                  {formatEther(
                    toBigNumber(userLock.lockedAmount).sub(toBigNumber(amount))
                  )}{' '}
                  KSU
                </Typography>{' '}
                {t('modals.unlock.completed.description-3')}
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                <Typography variant='h6' component='span'>
                  {formatEther(
                    toBigNumber(userLock.rKSUAmount)
                      .mul(ratio)
                      .div(toBigNumber('1'))
                  )}{' '}
                  rKSU
                </Typography>{' '}
                {t('modals.unlock.completed.description-4')}
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                <Typography variant='h6' component='span'>
                  {formatAmount(amount)} KSU
                </Typography>{' '}
                {t('modals.unlock.completed.description-5')}{' '}
                <Typography variant='h6' component='span'>
                  {formatAccount(account)}
                </Typography>{' '}
                {t('modals.unlock.completed.description-6')}
              </Typography>
            </li>
          </List>
        </>
      ) : (
        <Typography variant='body1' component='p' display='block' px={1}>
          {t('modals.unlock.completed.description-1')}{' '}
          <Typography variant='h6' component='span'>
            {formatAmount(amount)} KSU
          </Typography>{' '}
          {t('modals.unlock.completed.description-2')}
        </Typography>
      )}{' '}
    </Box>
  )
}

export default UnlockModalCompleted
