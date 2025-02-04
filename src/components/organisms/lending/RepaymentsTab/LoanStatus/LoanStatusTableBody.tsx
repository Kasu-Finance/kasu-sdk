import LoanStatusTableRow from '@/components/organisms/lending/RepaymentsTab/LoanStatus/LoanStatusTableRow'

export type LoanStatus = {
  borrower: string

  currentLoanBalance: number
  lifetimeFundingDrawdown: number
  lifetimePrincipalRepayments: number
  currentArrears: number
  historialRealisedLosses: number
  historicalRepayments: {
    openingLoanBalance: number
    newFundingDrawdowns: number
    principalInterestRepayments: number
    closingLoanBalance: number
    interestPaymentComponent: number
    arrears: number
    unrecoverableLosses: number
  }
}

const metrics: LoanStatus[] = [
  {
    borrower: 'Borrower 1',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 2',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 3',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 4',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 5',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 6',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 7',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 8',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
  {
    borrower: 'Borrower 9',
    currentLoanBalance: 448_342,
    lifetimeFundingDrawdown: 1_083_500,
    lifetimePrincipalRepayments: 1_595_193,
    currentArrears: 1_000,
    historialRealisedLosses: 0,
    historicalRepayments: {
      openingLoanBalance: 1_000_000,
      newFundingDrawdowns: 1_000_000,
      principalInterestRepayments: 800_000,
      closingLoanBalance: 1_5000_000,
      interestPaymentComponent: 500_000,
      arrears: 500_000,
      unrecoverableLosses: 500_000,
    },
  },
]

const LoanStatusTableBody = () => {
  return metrics.map((metric, index) => (
    <LoanStatusTableRow metric={metric} key={index} />
  ))
}

export default LoanStatusTableBody
