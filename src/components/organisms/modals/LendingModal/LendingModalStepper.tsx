import { Grid, Step, Stepper } from '@mui/material'

import useStepperState from '@/hooks/context/useStepperState'

const LendingModalStepper = () => {
  const { steps, activeStep } = useStepperState()

  return (
    <Stepper
      activeStep={activeStep}
      connector={null}
      component={Grid}
      container
    >
      {steps.map((step, index, origialArray) => (
        <Step
          component={Grid}
          item
          key={step}
          sx={{
            zIndex: origialArray.length - index,
            flex: 1,
            ml: index !== 0 ? -4 : 0,
            height: 36,
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            bgcolor: 'gold.dark',
            borderRadius: 30,
            color: 'gold.middle',
            textAlign: 'right',
            pr: 2,
            position: 'relative',
            '&::before': {
              position: 'absolute',
              content: '""',
              top: 0,
              left: 0,
              width: 0,
              height: '100%',
              borderRadius: 'inherit',
              bgcolor: 'gray.extraDark',
              transition: 'width 0.7s cubic-bezier(0, 0, 0, 1)',
              zIndex: -1,
            },
            '&.Mui-completed': {
              color: 'white',
              '&::before': {
                width: 'calc(100% + 1px)',
              },
            },
            '&:not(.Mui-completed)': {
              boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {step}
        </Step>
      ))}
    </Stepper>
  )
}

export default LendingModalStepper
