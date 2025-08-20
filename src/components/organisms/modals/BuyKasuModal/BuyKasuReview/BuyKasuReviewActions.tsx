import { Box, Button } from '@mui/material'

import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

const BuyKasuReviewActions = () => {
  const { t } = getTranslation()

  const { nextStep, prevStep } = useStepperState()

  return (
    <Box display='flex' gap={4}>
      <Button
        variant='outlined'
        color='secondary'
        onClick={prevStep}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.adjust')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={nextStep}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.confirm')}
        {/* {isApproved ? t('general.confirm') : t('general.approve')} */}
      </Button>
    </Box>
  )
}

export default BuyKasuReviewActions
