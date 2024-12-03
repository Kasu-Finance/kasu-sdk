import { Dispatch, useMemo } from 'react'

import {
  StepperActions,
  StepperActionTypes,
  StepperFunctions,
} from '@/context/stepper/stepper.types'

const useStepperActions = (
  dispatch: Dispatch<StepperActions>
): StepperFunctions =>
  useMemo(
    () => ({
      nextStep: () => dispatch({ type: StepperActionTypes.NEXT }),
      prevStep: () => dispatch({ type: StepperActionTypes.PREV }),
      setStep: (step: number) =>
        dispatch({ type: StepperActionTypes.SET_STEP, payload: step }),
    }),
    [dispatch]
  )

export default useStepperActions
