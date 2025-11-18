import { Box, Slider, Typography } from '@mui/material'
import React, { Dispatch, memo, SetStateAction } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import getTranslation from '@/hooks/useTranslation'

const MIN = 0
const MAX = 365

const marks = [
  {
    value: MIN,
    label: '',
  },
  {
    value: MAX,
    label: '',
  },
]

type SimulatedLendingDurationProps = {
  amount: string
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
}

const SimulatedLendingDuration: React.FC<SimulatedLendingDurationProps> = ({
  amount,
  duration,
  setDuration,
}) => {
  const { t } = getTranslation()

  const { setModalStatus } = useModalStatusState()

  const disabled = !amount

  const handleChange = (_: Event, value: number | number[]) => {
    setDuration(value as number)
  }

  const promptError = () =>
    setModalStatus({
      type: 'error',
      errorMessage: 'Amount is required',
    })

  return (
    <Box onClick={disabled ? promptError : undefined}>
      <Box display='flex' justifyContent='space-between' alignItems='end'>
        <Typography
          variant='baseXs'
          sx={{ cursor: 'pointer' }}
          onClick={() => setDuration(MIN)}
          color='white'
        >
          {MIN} {t('time.days')}
        </Typography>
        <Typography
          variant='baseXs'
          sx={{ cursor: 'pointer' }}
          onClick={() => setDuration(MAX)}
          color='white'
        >
          {MAX} {t('time.days')}
        </Typography>
      </Box>
      <Slider
        getAriaValueText={(val) => val.toString()}
        valueLabelFormat={(val) => `${val} ${t('time.days')}`}
        valueLabelDisplay='auto'
        step={1}
        marks={marks}
        max={365}
        value={duration}
        onChange={handleChange}
        disabled={disabled}
        color='secondary'
      />
    </Box>
  )
}

export default memo(SimulatedLendingDuration)
