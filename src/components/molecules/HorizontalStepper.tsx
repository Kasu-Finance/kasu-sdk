import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'

interface HorizontalStepperProps {
  steps: string[]
  activeStep?: number
  successColor?: string
}

const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
  steps,
  activeStep = 0,
  successColor = '',
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={(theme) => ({
          '& .MuiStepIcon-root.Mui-completed': {
            color: successColor || theme.palette.success.main,
          },
        })}
      >
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
