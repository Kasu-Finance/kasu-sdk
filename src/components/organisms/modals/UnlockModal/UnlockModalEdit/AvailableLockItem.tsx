import { Box, BoxProps, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import { formatAmount, formatTimestamp } from '@/utils'

type AvailableLockItemProps = BoxProps & {
  userLock: Omit<UserLock, 'id'>
}

const AvailableLockItem: React.FC<AvailableLockItemProps> = ({
  userLock,
  ...rest
}) => {
  const formattedTime = formatTimestamp(userLock.startTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      width='100%'
      {...rest}
    >
      <Typography variant='baseMd'>
        {formattedTime.date}{' '}
        <Typography
          variant='inherit'
          color='rgba(133, 87, 38, 1)'
          display='inline'
        >
          {formattedTime.timestamp} {formattedTime.utcOffset}
        </Typography>
      </Typography>
      <Typography variant='baseMd'>
        <Typography
          variant='inherit'
          color='rgba(133, 87, 38, 1)'
          display='inline'
        >
          KASU{' '}
        </Typography>
        {formatAmount(userLock.lockedAmount, {
          minDecimals: 2,
          minValue: 100_000,
        })}
      </Typography>
    </Box>
  )
}
export default AvailableLockItem
