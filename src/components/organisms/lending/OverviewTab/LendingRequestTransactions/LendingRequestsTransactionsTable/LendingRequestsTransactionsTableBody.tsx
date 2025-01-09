'use client'

import LendingRequestsTransactionsTableRow from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/LendingRequestsTransactionsTable/LendingRequestsTransactionsTableRow'

import { DetailedTransactionWrapper } from '@/utils/lending/getDetailedTransactions'

type LendingRequestsTransactionsTableBodyProps = {
  transactions: DetailedTransactionWrapper[]
  currentEpoch: string
}

const LendingRequestsTransactionsTableBody: React.FC<
  LendingRequestsTransactionsTableBodyProps
> = ({ transactions, currentEpoch }) => {
  return transactions.map((transaction, index) => (
    <LendingRequestsTransactionsTableRow
      currentEpoch={currentEpoch}
      transactionWrapper={transaction}
      key={index}
    />
  ))
}

export default LendingRequestsTransactionsTableBody
