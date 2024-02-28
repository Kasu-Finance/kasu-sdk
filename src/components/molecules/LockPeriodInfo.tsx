import { Box, Divider, Typography } from '@mui/material'
import { LockPeriod } from 'kasu-sdk/src/types'
import React from 'react'

import useLockPeriods from '@/hooks/locking/useLockPeriods'
import useTranslation from '@/hooks/useTranslation'

import { ArrowRightIcon } from '@/assets/icons'

type LockPeriodInfoProps = {
  activePeriod?: LockPeriod
}

const LockPeriodInfo: React.FC<LockPeriodInfoProps> = ({ activePeriod }) => {
  const { t } = useTranslation()

  const { lockPeriods } = useLockPeriods()

  const currentIndex = activePeriod
    ? lockPeriods.findIndex((period) => period.id === activePeriod.id)
    : lockPeriods.length

  return (
    <Box
      display='grid'
      gridTemplateColumns='minmax(0,1fr) max-content minmax(0,1fr) max-content minmax(0,1fr) max-content minmax(0,1fr)'
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
            {index !== 0 && <ArrowRightIcon />}
            <Box textAlign='center'>
              <Typography
                variant='subtitle2'
                component='span'
                display='block'
                p={(theme) => theme.spacing('6px', 2)}
              >
                {period.lockPeriod} {t('time.days')}
              </Typography>
              <Divider />
              <Typography
                variant='subtitle2'
                component='span'
                display='block'
                p={(theme) => theme.spacing('6px', 2)}
              >
                {period.ksuBonusMultiplier} ✕
                <br />
                <Typography variant='caption' component='span'>
                  multiplier
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
