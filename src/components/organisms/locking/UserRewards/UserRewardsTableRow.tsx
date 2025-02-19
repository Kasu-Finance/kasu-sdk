import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import {
  LockPeriod,
  UserLock,
} from '@solidant/kasu-sdk/src/services/Locking/types'
import { formatEther } from 'ethers/lib/utils'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useCountdown from '@/hooks/useCountdown'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { UnlockIcon } from '@/assets/icons'

import { DATE_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import {
  convertToUSD,
  formatAmount,
  formatTimestamp,
  toBigNumber,
} from '@/utils'

type UserRewardsTableRowProps = {
  userLock: UserLock
  lockPeriods: LockPeriod[]
}

const UserRewardsTableRow: React.FC<UserRewardsTableRowProps> = ({
  userLock,
  lockPeriods,
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const [timeLeft, timeUnit] = useCountdown(userLock.endTime, {
    toNearestUnit: true,
  }).split(' ')

  const { ksuPrice } = useKsuPrice()

  const handleOpen = () => {
    openModal({ name: ModalsKeys.UNLOCK, userLock, lockPeriods })
  }

  const formattedTime = formatTimestamp(userLock.startTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  const isUnlocked = dayjs.unix(userLock.endTime).isBefore()

  return (
    <>
      <TableRow key={userLock.id.toString()}>
        <TableCell>
          <Stack>
            <Typography variant='baseMdBold'>
              {formatAmount(userLock.lockedAmount, { minDecimals: 2 })} KSU
            </Typography>
            <Typography variant='baseMd' color='gray.middle'>
              {formatAmount(
                formatEther(
                  convertToUSD(
                    toBigNumber(userLock.lockedAmount),
                    toBigNumber(ksuPrice || '0')
                  )
                ),
                { minDecimals: 2 }
              )}{' '}
              USDC
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Box display='flex' alignItems='center'>
            <Typography variant='baseMd' color='gray.middle' mr={4}>
              {formattedTime.date} • {formattedTime.timestamp}{' '}
              {formattedTime.utcOffset}
            </Typography>
            {isUnlocked && (
              <Button
                startIcon={<UnlockIcon />}
                variant='text'
                sx={{
                  color: 'gold.dark',
                  ml: 'auto',
                  py: 0,
                  height: 'max-content',
                }}
                onClick={handleOpen}
              >
                {t('general.unlock')}
              </Button>
            )}
          </Box>
        </TableCell>
        <TableCell>
          {dayjs.unix(userLock.endTime).format(DATE_FORMAT)}
        </TableCell>
        <TableCell>
          {timeLeft} {timeUnit}
        </TableCell>
        <TableCell>
          {formatAmount(userLock.lockPeriod.rKSUMultiplier, { minDecimals: 2 })}
          ✕
        </TableCell>
        <TableCell align='right'>
          <Stack>
            <Typography variant='baseMd'>
              {formatAmount(userLock.rKSUAmount, { minDecimals: 2 })} rKSU
            </Typography>
            <Typography variant='baseMd' color='gray.middle'>
              {formatAmount(
                formatEther(
                  convertToUSD(
                    toBigNumber(userLock.rKSUAmount),
                    toBigNumber(ksuPrice || '0')
                  )
                ),
                { minDecimals: 2 }
              )}{' '}
              USDC
            </Typography>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default UserRewardsTableRow
