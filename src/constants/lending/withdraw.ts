export enum WithdrawSteps {
  REQUEST = 0,
  APPROVE = 1,
  CONFIRM = 2,
}

export enum WithdrawMetrics {
  TOTAL_INVESTMENT = 'totalInvestment',
  TRANCHE_INVESTMENT = 'trancheInvestment',
}

export enum WithdrawErrors {
  INVALID_CRITERIA = 'The value entered does not meet the criteria required for this field.',
}

export enum Tranche {
  JUNIOR_TRANCHE = 'juniorTranche',
  MEZZANINE_TRANCE = 'mezzanineTranche',
  SENIOR_TRANCHE = 'seniorTranche',
}
