export enum WithdrawSteps {
  REQUEST = 0,
  APPROVE = 1,
  CONFIRM = 3,
}

export enum WithdrawMetrics {
  TOTAL_INVESTMENT = 'totalInvestment',
  TRANCHE_INVESTMENT = 'trancheInvestment',
  TRANCHE = 'tranche',
  TO_WALLET = 'toWallet',
}

export enum Tranche {
  JUNIOR_TRANCHE = 'Junior Tranche',
  MEZZANINE_TRANCE = 'Mezzanine Tranche',
  SENIOR_TRANCHE = 'Senior Tranche',
}
