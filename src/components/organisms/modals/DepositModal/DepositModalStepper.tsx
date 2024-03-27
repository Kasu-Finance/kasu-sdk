import { Divider, Step, StepLabel, Stepper } from '@mui/material'

import useModalStatusState from '@/hooks/context/useModalStatusState'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

const STEPS = ['Deposit', 'Approval', 'Confirmation']

const getActiveStep = (modalStatusAction: ModalStatusAction) => {
  switch (modalStatusAction) {
    case ModalStatusAction.EDITING:
      return 0
    case ModalStatusAction.REVIEWING:
      return 1
    case ModalStatusAction.COMPLETED:
      return 2
  }
}

const DepositModalStepper = () => {
  const { modalStatusAction } = useModalStatusState()

  return (
    <Stepper
      activeStep={getActiveStep(modalStatusAction)}
      alternativeLabel
      connector={null}
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns:
          'max-content minmax(0,1fr) max-content minmax(0,1fr) max-content',
        '& .MuiStepIcon-root.Mui-completed': {
          color: theme.palette.success.main,
        },
      })}
    >
      {STEPS.map((label, index) => (
        <Step sx={{ display: 'contents' }} key={label}>
          {index !== 0 && (
            <Divider sx={{ mt: 1.5, borderColor: 'rgba(189, 189, 189, 1)' }} />
          )}
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}

export default DepositModalStepper
