import { Box, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { useWeb3React } from '@web3-react/core'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useRatio from '@/hooks/useRatio'

import List from '@/components/atoms/List'

import { formatAccount, formatAmount, toBigNumber } from '@/utils'

type UnlockModalCompletedProps = {
  userLock: UserLock
}

const UnlockModalCompleted: React.FC<UnlockModalCompletedProps> = ({
  userLock,
}) => {
  const { amount } = useLockModalState()

  const { account } = useWeb3React()

  const isPartial = !toBigNumber(amount).eq(toBigNumber(userLock.lockedAmount))

  const ratio = useRatio(amount, userLock.lockedAmount)

  return (
    <Box p={1}>
      {isPartial ? (
        <>
          <Typography variant='body1' component='p'>
            You have successfully requested:
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
                to remain locked and
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
                to be burned and
              </Typography>
            </li>
            <li>
              <Typography variant='body1' component='p'>
                <Typography variant='h6' component='span'>
                  {formatAmount(amount)} KSU
                </Typography>{' '}
                to be withdrawn to the wallet{' '}
                <Typography variant='h6' component='span'>
                  {formatAccount(account)}
                </Typography>{' '}
                in the next Epoch
              </Typography>
            </li>
          </List>
        </>
      ) : (
        <Typography variant='body1' component='p' display='block' px={1}>
          You have successfully requested{' '}
          <Typography variant='h6' component='span'>
            {formatAmount(amount)} KSU
          </Typography>{' '}
          to be unlocked in the next Epoch.
        </Typography>
      )}{' '}
    </Box>
  )
}

export default UnlockModalCompleted
