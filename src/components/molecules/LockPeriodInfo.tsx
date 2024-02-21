import { Box, Divider, Typography } from '@mui/material'

import useLockPeriods from '@/hooks/locking/useLockPeriods'
import useTranslation from '@/hooks/useTranslation'

import { ArrowRightIcon } from '@/assets/icons'

const LockPeriodInfo = () => {
  const { t } = useTranslation()

  const { lockPeriods } = useLockPeriods()

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
      {lockPeriods.map((period, index) => (
        <>
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
              0.05 ✕
              <br />
              <Typography variant='caption' component='span'>
                multiplier
              </Typography>
            </Typography>
          </Box>
        </>
      ))}
    </Box>
  )
}

export default LockPeriodInfo
