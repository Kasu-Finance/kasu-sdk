import { Box, Slider, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'

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

const SimulatedLendingDuration = () => {
  const { t } = useTranslation()

  const { setModalStatus } = useModalStatusState()

  const { amount, setSimulatedDuration, setIsDebouncing } =
    useDepositModalState()

  const { debouncedFunction, isDebouncing } = useDebounce(
    setSimulatedDuration,
    500
  )

  // setting state here instead of using value from context to prevent unncesary rerenders
  const [duration, setDuration] = useState(0)

  const disabled = !amount

  const handleChange = (_: Event, value: number | number[]) => {
    setDuration(value as number)
    debouncedFunction(value as number)
  }

  const promptError = () =>
    setModalStatus({
      type: 'error',
      errorMessage: 'Amount is required',
    })

  useEffect(() => {
    setIsDebouncing(isDebouncing)
  }, [isDebouncing, setIsDebouncing])

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

export default SimulatedLendingDuration
