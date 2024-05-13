import Divider from '@mui/material/Divider'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import React from 'react'

interface HorizontalStepperProps {
  steps: string[]
  activeStep: number
}

const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
  steps,
  activeStep,
}) => {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      connector={null}
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns:
          'max-content minmax(0,1fr) max-content minmax(0,1fr) max-content',
        '& .MuiStepIcon-root.Mui-completed': {
          color: theme.palette.success.main,
        },
        '& .MuiStepIcon-text': {
          fill: 'white',
        },
      })}
    >
      {steps.map((label, index) => (
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

export default HorizontalStepper
