import { Box, Slider, Typography } from '@mui/material'
import { LockPeriod } from 'kasu-sdk/src/types'
import { Dispatch, SetStateAction } from 'react'

import useLockPeriods from '@/hooks/locking/useLockPeriods'

import ColoredBox from '@/components/atoms/ColoredBox'

import dayjs from '@/dayjs'

type LockDurationInputProps = {
  selectedLockPeriod: LockPeriod
  setSelectedLockPeriod: Dispatch<SetStateAction<LockPeriod>>
}

const LockDurationInput: React.FC<LockDurationInputProps> = ({
  selectedLockPeriod,
  setSelectedLockPeriod,
}) => {
  const { lockPeriods } = useLockPeriods()

  const handleChange = (_: Event, value: number | number[]) => {
    setSelectedLockPeriod(lockPeriods[value as number])
  }

  const unlockTime = dayjs().add(Number(selectedLockPeriod.lockPeriod), 'days')

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        Locking Duration
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
          marks={lockPeriods.map((period, index) => ({
            value: index,
            label: period.lockPeriod.toString(),
          }))}
          max={lockPeriods.length - 1}
          value={lockPeriods.findIndex(
            ({ lockPeriod }) => lockPeriod === selectedLockPeriod.lockPeriod
          )}
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
          Duration in Days
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
          Unlocking Date
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
