import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import * as React from 'react'

interface HorizontalStepperProps {
  steps?: string[]
}

const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
  steps = ['', '', ''],
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={0} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}

export default HorizontalStepper
