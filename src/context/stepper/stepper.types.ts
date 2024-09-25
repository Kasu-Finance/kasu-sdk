export enum StepperActionTypes {
  NEXT = 'NEXT_STEP',
  PREV = 'PREV_STEP',
  SET_STEP = 'SET_STEP',
}

export type StepperActions =
  | {
      type: StepperActionTypes.NEXT
    }
  | {
      type: StepperActionTypes.PREV
    }
  | {
      type: StepperActionTypes.SET_STEP
      payload: number
    }

export type StepperStateType = {
  activeStep: number
  steps: number[]
}

export type StepperFunctions = {
  nextStep: () => void
  prevStep: () => void
  setStep: (step: number) => void
}

export type StepperTypes = StepperStateType & StepperFunctions
