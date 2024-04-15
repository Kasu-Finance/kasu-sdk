export enum RepaymentsMetrics {
  CLOSING_LOANS = 'closingLoans',
  OPENING_LOANS = 'openingLoans',
  LOANS_DRAWN = 'loansDrawn',
  INTEREST_ACCRUED = 'interestAccrued',
  INTEREST_PAYMENTS = 'interestPayments',
  PRINCIPAL_REPAYMENTS = 'principalRepayments',
  UNREALISED_LOSSES = 'unrealisedLosses',
  NET_INFLOWS = 'netInflows',
  NET_DEPOSIT = 'netDeposit',
  CUMULATIVE_WITHDRAW = 'cumulativeWithdraw',
  CUMULATIVE_DEPOSIT = 'cumulativeDeposit',
  NET_DEPOSITS = 'netDeposits',
  CURRENT_DEPOSITS_REQUESTS = 'currentDeposits',
  CURRENT_WITHDRAWAL_REQUESTS = 'currentWithdrawal',
}

export enum SectionKeys {
  CumulativeFunds = 'cumulativeFunds',
  Transactions = 'transactions',
  FundsRequest = 'fundsRequest',
  UpcomingFunds = 'upcomingFunds',
}
