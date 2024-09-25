import { useContext } from 'react'

import stepperContext from '@/context/stepper/stepper.context'
import { StepperTypes } from '@/context/stepper/stepper.types'

const useStepperState = (): StepperTypes => {
  const context = useContext(stepperContext)

  if (!Object.keys(context).length) {
    throw new Error('StepperContext must be used within its provider')
  }

  return context
}

export default useStepperState
