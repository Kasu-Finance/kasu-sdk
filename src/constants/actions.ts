export enum ActionStatus {
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
  SUCCESS = 'SUCCESSFUL',
  ERROR = 'ERROR',
}

export enum ActionType {
  APPROVE = 'APPROVAL',
  KYC = 'IDENTITY VERIFICATION',
  CLAIM_REWARDS = 'CLAIM REWARDS',
  LOCK = 'LOCK',
  LENDING = 'LENDING',
  WITHDRAW = 'WITHDRAW',
}

export const ACTION_MESSAGES = {
  [ActionStatus.REJECTED]: 'The transaction has been rejected.',
  [ActionStatus.PROCESSING]: 'Your transaction request is being processed...',
  [ActionType.APPROVE]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the approval request. Please review log for more details.',
  },
  [ActionType.KYC]: {
    [ActionStatus.SUCCESS]: (countDown: number) =>
      `Identity verification process was successful. In ${countDown} seconds you will be redirected to the previous process.`,
    [ActionStatus.ERROR]: (name: string) =>
      `An error has occurred during the identity verification process provided by ${name}. Please review log for more details.`,
  },
  [ActionType.LENDING]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the lending request. Please review log for more details.',
  },
  [ActionType.LOCK]: {
    [ActionStatus.SUCCESS]: 'Lock request has been successfull.',
    [ActionStatus.ERROR]:
      'An error has occurred in the lock request. Please review log for more details.',
  },
  [ActionType.CLAIM_REWARDS]: {
    [ActionStatus.SUCCESS]: 'Claim request has been successfull.',
    [ActionStatus.ERROR]:
      'An error has occurred in the claim request. Please review log for more details.',
  },
  [ActionType.WITHDRAW]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the withdraw request. Please review log for more details.',
  },
} as const
