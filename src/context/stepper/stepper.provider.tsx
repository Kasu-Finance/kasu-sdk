import { ReactNode, useReducer } from 'react'

import useStepperActions from '@/context/stepper/stepper.actions'
import StepperContext from '@/context/stepper/stepper.context'
import stepperReducer from '@/context/stepper/stepper.reducer'
import { StepperStateType } from '@/context/stepper/stepper.types'

type StepperStateProps = {
  children: ReactNode
  steps: number
}

const initialState: Omit<StepperStateType, 'steps'> = {
  activeStep: 1,
}

const StepperState: React.FC<StepperStateProps> = ({ children, steps }) => {
  const [state, dispatch] = useReducer(stepperReducer, {
    ...initialState,
    steps: [...new Array(steps)].map((_, index) => index + 1),
  })

  const stepperActions = useStepperActions(dispatch)

  return (
    <StepperContext.Provider value={{ ...state, ...stepperActions }}>
      {children}
    </StepperContext.Provider>
  )
}

export default StepperState
