export enum ActionStatus {
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
  SUCCESS = 'SUCCESSFUL',
  ERROR = 'ERROR',
}

export enum ActionType {
  APPROVE = 'APPROVAL',
  KYC_AUTH = 'KYC Authorisation',
  KYC = 'IDENTITY VERIFICATION',
  CLAIM_REWARDS = 'CLAIM REWARDS',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export const ACTION_MESSAGES = {
  [ActionStatus.REJECTED]: 'The transaction has been rejected.',
  [ActionStatus.PROCESSING]: 'Your transaction request is being processed...',
  [ActionType.APPROVE]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the approval request. Please review log for more details.',
  },
  [ActionType.KYC_AUTH]: {
    [ActionStatus.PROCESSING]:
      'Your authorisation request is being processed...',
    [ActionStatus.ERROR]:
      'An error has occurred during obtaining the authorisation token required during KYC process.',
  },
  [ActionType.KYC]: {
    [ActionStatus.SUCCESS]: (countDown: number) =>
      `Identity verification process was successful. In ${countDown} seconds you will be redirected to the previous process.`,

    [ActionStatus.ERROR]:
      'An error has occurred during the identity verification process provided by Nexera.',
  },
  [ActionType.DEPOSIT]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the deposit request. Please review log for more details.',
  },
  [ActionType.LOCK]: {
    [ActionStatus.SUCCESS]: 'Lock request has been successfull.',
    [ActionStatus.ERROR]:
      'An error has occurred in the lock request. Please review log for more details.',
  },
  [ActionType.UNLOCK]: {
    [ActionStatus.ERROR]:
      'An error has occurred during the unlock request. Please review log for more details.',
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
