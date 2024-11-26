export enum ActionStatus {
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
  SUCCESS = 'SUCCESSFUL',
  ERROR = 'ERROR',
  SIGNING = 'SIGNING',
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
  FUNDING_CONSENT = 'Funding Consent',
  FIX_APY = 'Fix APY',
  WITHDRAW_AT_EXPIRY = 'Withdraw Funds at Expiry',
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
  [ActionType.FUNDING_CONSENT]: {
    [ActionStatus.SIGNING]:
      'Please sign the transaction in your wallet to register your choice',
    [ActionStatus.PROCESSING]: 'Your choice submission is being processed',
  },
  [ActionType.FIX_APY]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the Fix Apy Request. Please review log for more details.',
  },
  [ActionType.WITHDRAW_AT_EXPIRY]: {
    [ActionStatus.ERROR]:
      'An error has occurred in the Withdraw at Expiry Request. Please review log for more details.',
  },
} as const
