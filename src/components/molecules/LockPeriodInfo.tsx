import { Box, Divider, Typography } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import { formatAmount, TimeConversions } from '@/utils'

type LockPeriodInfoProps = {
  activePeriod?: LockPeriod
  lockPeriods: LockPeriod[]
}

const LockPeriodInfo: React.FC<LockPeriodInfoProps> = ({
  activePeriod,
  lockPeriods,
}) => {
  const { t } = getTranslation()

  const currentIndex = activePeriod
    ? lockPeriods.findIndex((period) => period.id === activePeriod.id)
    : lockPeriods.length

  return (
    <Box
      display='grid'
      gridTemplateColumns='minmax(0, 0.5fr) minmax(0,1fr)  minmax(0,1fr) minmax(0, 0.5fr)'
      gap={1}
      sx={{
        'svg ': {
          width: 16,
          height: 16,
          mt: '28px',
          '& > path': {
            fill: 'black',
          },
        },
      }}
    >
      {lockPeriods.map((period, index) => {
        const disabled = currentIndex < index

        return (
          <Box
            display='contents'
            color={(theme) =>
              disabled ? theme.palette.text.disabled : undefined
            }
            sx={(theme) => ({
              '& svg > path': {
                fill: disabled ? theme.palette.text.disabled : undefined,
              },
            })}
            key={period.lockPeriod}
          >
            <Box textAlign='center'>
              <Typography
                variant='subtitle2'
                component='span'
                display='block'
                p={(theme) => theme.spacing('6px', 2)}
              >
                {parseFloat(period.lockPeriod) /
                  TimeConversions.SECONDS_PER_DAY}{' '}
                {t('time.days')}
              </Typography>
              <Divider />
              <Typography
                variant='subtitle2'
                component='span'
                display='block'
                p={(theme) => theme.spacing('6px', 2)}
              >
                {formatAmount(period.rKSUMultiplier || '0', {
                  hideTrailingZero: false,
                })}{' '}
                ✕
                <br />
                <Typography variant='caption' component='span'>
                  {t('general.multiplier')}
                </Typography>
              </Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default LockPeriodInfo
