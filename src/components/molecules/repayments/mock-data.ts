export const fundsFlowReport = {
  cumulativeFunds: {
    title: 'Cumulative Lending Funds Flow',
    titleSuffix: '(Actual)',
    metrics: [
      { id: 'closingLoans', content: '100', unit: 'USDT' },
      { id: 'openingLoans', content: '200', unit: 'USDT' },
      { id: 'loansDrawn', content: '300', unit: 'USDT' },
      { id: 'interestAccrued', content: '400', unit: 'USDT' },
      { id: 'interestPayments', content: '500', unit: 'USDT' },
      { id: 'principalRepayments', content: '600', unit: 'USDT' },
      { id: 'unrealisedLosses', content: '700', unit: 'USDT' },
    ],
  },
  upcomingFunds: {
    title: 'Upcoming Lending Funds Flow',
    titleSuffix: '(Current Epoch)',
    metrics: [
      { id: 'netInflows', content: '800', unit: 'USDT' },
      { id: 'upcomingLoan', content: '900', unit: 'USDT' },
      { id: 'upcomingInterest', content: '1000', unit: 'USDT' },
      { id: 'upcomingPrincipal', content: '1100', unit: 'USDT' },
    ],
  },
  transactions: {
    title: 'Cumulative Deposits & Withdrawals',
    titleSuffix: '(Actual)',
    metrics: [
      { id: 'netDeposit', content: '1200', unit: 'USDT' },
      { id: 'cumulativeDeposit', content: '1300', unit: 'USDT' },
      { id: 'cumulativeWithdraw', content: '1400', unit: 'USDT' },
    ],
  },
  fundsRequest: {
    title: 'Cumulative Deposits & Withdrawals',
    titleSuffix: '(Actual)',
    metrics: [
      { id: 'netDeposits', content: '1500', unit: 'USDT' },
      { id: 'currentDeposits', content: '1600', unit: 'USDT' },
      { id: 'currentWithdrawal', content: '1700', unit: 'USDT' },
    ],
  },
}
