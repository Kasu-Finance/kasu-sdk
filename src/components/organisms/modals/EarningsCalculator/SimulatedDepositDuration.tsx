import { Box, Slider, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

const SimulatedDepositDuration = () => {
  const { t } = useTranslation()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { simulatedDuration, setSimulatedDuration } = useDepositModalState()

  const handleChange = (_: Event, value: number | number[]) => {
    setSimulatedDuration(value as number)
  }

  const disabled = modalStatus.type === 'error'

  return (
    <Box mt={2}>
      <Typography variant='subtitle1' component='span'>
        {t('modals.earningsCalculator.simulatedDuration.title')}
      </Typography>
      <Typography
        variant='caption'
        component='p'
        textAlign='center'
        display='block'
        mx='auto'
        mt={1}
      >
        {t('modals.earningsCalculator.simulatedDuration.description-1')}
        <br />
        {t('modals.earningsCalculator.simulatedDuration.description-2')}
      </Typography>
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
        onChangeCommitted={() => setModalStatus({ type: 'default' })}
      />
    </Box>
  )
}

export default SimulatedDepositDuration
