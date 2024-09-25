import { createContext } from 'react'

import { StepperTypes } from '@/context/stepper/stepper.types'

const stepperContext = createContext({} as StepperTypes)
stepperContext.displayName = 'StepperContext'

export default stepperContext
