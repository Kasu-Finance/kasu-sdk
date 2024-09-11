import { Box, Button, TableCell, TableRow, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import useModalState from '@/hooks/context/useModalState'
import useCountdown from '@/hooks/useCountdown'
import useTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { UnlockIcon } from '@/assets/icons'

import { DATE_FORMAT } from '@/constants'
import dayjs from '@/dayjs'
import { formatAmount, formatTimestamp } from '@/utils'

type UserRewardsTableRowProps = {
  userLock: UserLock
}

const UserRewardsTableRow: React.FC<UserRewardsTableRowProps> = ({
  userLock,
}) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const [timeLeft, timeUnit] = useCountdown(userLock.endTime, {
    toNearestUnit: true,
  }).split(' ')

  const handleOpen = () => {
    openModal({ name: ModalsKeys.UNLOCK, userLock })
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
          <Box display='flex' alignItems='center'>
            <Typography variant='baseMdBold' mr='1ch'>
              {formatAmount(userLock.lockedAmount, { minDecimals: 2 })} KSU
            </Typography>
            <Typography variant='baseMd' color='gray.middle' mr={4}>
              {formattedTime.date} • {formattedTime.timestamp}{' '}
              {formattedTime.utcOffset}
            </Typography>
            {isUnlocked && (
              <Button
                startIcon={<UnlockIcon />}
                variant='text'
                sx={{ color: 'gold.dark', ml: 'auto' }}
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
        <TableCell>
          {formatAmount(userLock.rKSUAmount, { minDecimals: 2 })} rKSU
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0 }}>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </>
  )
}

export default UserRewardsTableRow
