import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import SimulatedDurationSlider from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositDuration/SimulatedDurationSlider'

const SimulatedDepositDuration = () => {
  const { t } = useTranslation()

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
      <SimulatedDurationSlider />
    </Box>
  )
}

export default SimulatedDepositDuration
