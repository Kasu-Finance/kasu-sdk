import { Slider } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

const SimulatedDurationSlider = () => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const { simulatedDuration, setSimulatedDuration } = useDepositModalState()

  const handleChange = (_: Event, value: number | number[]) => {
    setSimulatedDuration(value as number)
  }

  const disabled = modalStatus.type === 'error'

  return (
    <Slider
      disabled={disabled}
      sx={{
        maxWidth: 430,
      }}
      getAriaValueText={(val) => val.toString()}
      valueLabelFormat={(val) => `${val} ${t('time.days')}`}
      valueLabelDisplay='auto'
      step={1}
      marks={
        disabled
          ? undefined
          : [
              { value: 0, label: `0 ${t('time.days')}` },
              { value: 365, label: `365 ${t('time.days')}` },
            ]
      }
      max={365}
      value={simulatedDuration}
      onChange={handleChange}
    />
  )
}

export default SimulatedDurationSlider
