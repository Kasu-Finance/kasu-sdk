import { Button } from '@mui/material'
import { memo } from 'react'

import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

const BuyKasuEditAction = () => {
  const { t } = getTranslation()

  const { nextStep } = useStepperState()

  const handleClick = () => {
    nextStep()
  }

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={handleClick}
      fullWidth
      sx={{ textTransform: 'capitalize' }}
    >
      {t('modals.buyKasu.completed.action')}
    </Button>
  )
}

export default memo(BuyKasuEditAction)
