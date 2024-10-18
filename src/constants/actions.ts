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
  LOCK = 'LOCKING',
  UNLOCK = 'UNLOCK',
  DEPOSIT = 'LENDING REQUEST',
  WITHDRAW = 'WITHDRAWAL REQUEST',
  CANCELLATION = 'CANCELLATION',
}

export const ACTION_MESSAGES = {
  [ActionStatus.REJECTED]: 'The transaction has been rejected.',
  [ActionStatus.PROCESSING]: 'Your transaction request is being processed...',
  [ActionType.APPROVE]: {
    [ActionStatus.PROCESSING]: 'Please approve transaction in your wallet...',
    [ActionStatus.ERROR]:
      'An error has occurred in the Approval Request. Please review log for more details.',
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
      'An error has occurred during the Lending Request. Please review log for more details.',
  },
  [ActionType.LOCK]: {
    [ActionStatus.SUCCESS]: 'Lock request has been successfull.',
    [ActionStatus.ERROR]:
      'An error has occurred during the KSU Lock Request. Please review log for more details.',
  },
  [ActionType.UNLOCK]: {
    [ActionStatus.ERROR]:
      'An error has occurred during the KSU Unlock Request. Please review log for more details.',
  },
  [ActionType.CLAIM_REWARDS]: {
    [ActionStatus.SUCCESS]: 'Claim Request has been successfull.',
    [ActionStatus.ERROR]:
      'An error has occurred in the Claim Request. Please review log for more details.',
  },
  [ActionType.WITHDRAW]: {
    [ActionStatus.ERROR]:
      'An error has occurred during the Withdrawal Request. Please review log for more details.',
  },
  [ActionType.CANCELLATION]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the transaction Cancellation Request. Please review log for more details.',
  },
} as const
