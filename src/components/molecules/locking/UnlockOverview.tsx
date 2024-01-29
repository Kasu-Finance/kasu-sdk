'use client'

import { Typography } from '@mui/material'
import { unix } from 'dayjs'
import { Fragment } from 'react'

import useUserLocks from '@/hooks/locking/useUserLocks'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

const UnlockOverview = () => {
  const { userLocks } = useUserLocks()

  const hasLockedTokens = userLocks && Boolean(userLocks.length)
  return (
    <CardWidget title='Time until KASU unlock'>
      <ColoredBox display='grid' rowGap={1}>
        {hasLockedTokens ? (
          userLocks.map(({ lockedAmount, endTime }) => (
            <Fragment key={endTime}>
              <InfoRow
                title={lockedAmount + ' KSU unlocks on'}
                tooltip={false}
                info='date'
                metricStyle='subtitle2'
                metricInfo={unix(endTime).format('Do MMM YYYY') + ''}
              />
            </Fragment>
          ))
        ) : (
          <Typography
            variant='subtitle2'
            component='span'
            mx='6px'
            my={1}
            display='block'
          >
            Currently no locked KASU
          </Typography>
        )}
      </ColoredBox>
    </CardWidget>
  )
}

export default UnlockOverview
