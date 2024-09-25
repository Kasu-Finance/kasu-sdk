import {
  StepperActions,
  StepperActionTypes,
  StepperStateType,
} from '@/context/stepper/stepper.types'

const stepperReducer = (
  state: StepperStateType,
  action: StepperActions
): StepperStateType => {
  switch (action.type) {
    case StepperActionTypes.NEXT:
      if (state.activeStep === 1) {
        return state
      }

      return {
        ...state,
        activeStep: state.activeStep - 1,
      }
    case StepperActionTypes.PREV:
      if (state.activeStep === state.steps.length) {
        return state
      }

      return {
        ...state,
        activeStep: state.activeStep + 1,
      }
    case StepperActionTypes.SET_STEP:
      if (action.payload < 1 || action.payload > state.steps.length) {
        return state
      }

      return {
        ...state,
        activeStep: action.payload,
      }
  }
}

export default stepperReducer
