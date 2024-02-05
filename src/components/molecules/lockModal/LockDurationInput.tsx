import { Box, Slider, Typography } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'

import LOCK_PERIODS from '@/config/lockPeriod'
import dayjs from '@/dayjs'

const MARKS = LOCK_PERIODS.map((period, index) => ({
  value: index,
  label: period,
}))

type LockDurationInputProps = {
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
}

const LockDurationInput: React.FC<LockDurationInputProps> = ({
  duration,
  setDuration,
}) => {
  const handleChange = (_: Event, value: number | number[]) => {
    setDuration(LOCK_PERIODS[value as number])
  }
  const { t } = useTranslation()

  const unlockTime = dayjs().add(duration, 'days')

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        {t('modals.lock.duration.title')}
      </Typography>
      <Box>
        <Slider
          sx={{
            mt: 2,
            mb: 2.5,
            '& .MuiSlider-markLabel': {
              mt: 1.5,
              '&[data-index="0"]': {
                left: 0,
                transform: 'none',
              },
              '&[data-index="3"]': {
                transform: 'translateX(-3ch)',
              },
            },
          }}
          getAriaValueText={(val) => val.toString()}
          step={null}
          marks={MARKS}
          max={LOCK_PERIODS.length - 1}
          value={LOCK_PERIODS.indexOf(duration)}
          onChange={handleChange}
        />
        <Typography
          variant='caption'
          component='span'
          display='block'
          mx='auto'
          width='max-content'
          mt={1}
        >
          {t('modals.lock.duration.duration')}
        </Typography>
      </Box>
      <ColoredBox
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mt={1}
        sx={{
          px: 2,
          py: '6px',
        }}
      >
        <Typography variant='subtitle2' component='span'>
          {t('modals.lock.duration.unlocking')}
        </Typography>
        <Box textAlign='right'>
          <Typography variant='body2' component='span'>
            {unlockTime.format('DD.MM.YYYY')}
          </Typography>
          <Typography variant='caption' component='span' display='block'>
            {unlockTime.format('HH:mm:ss UTCZZ')}
          </Typography>
        </Box>
      </ColoredBox>
    </Box>
  )
}

export default LockDurationInput
