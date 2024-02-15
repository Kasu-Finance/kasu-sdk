'use client'

import { Box, Typography } from '@mui/material'
import { Fragment } from 'react'

import useUserLocks from '@/hooks/locking/useUserLocks'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'

import dayjs from '@/dayjs'

const UnlockOverview = () => {
  const { userLocks } = useUserLocks()
  const { t } = useTranslation()

  const hasLockedTokens = userLocks && Boolean(userLocks.length)
  return (
    <CardWidget title='Time until KASU unlock'>
      <ColoredBox display='grid' rowGap={1}>
        {hasLockedTokens ? (
          userLocks.map(({ lockedAmount, endTime }, index) => (
            <Fragment key={endTime}>
              <InfoRow
                title={lockedAmount + ' KSU unlocks on'}
                titleStyle={{ color: 'text.secondary' }}
                showDivider={index !== userLocks.length - 1}
                metric={
                  <Box textAlign='right'>
                    <Typography variant='body2' component='span'>
                      {dayjs.unix(endTime).format('DD.MM.YYYY')}
                    </Typography>
                    <Typography
                      variant='caption'
                      component='span'
                      display='block'
                    >
                      {dayjs.unix(endTime).format('HH:mm:ss UTCZZ')}
                    </Typography>
                  </Box>
                }
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
            {t('locking.widgets.unlock.noLockedKasu')}
          </Typography>
        )}
      </ColoredBox>
    </CardWidget>
  )
}

export default UnlockOverview
