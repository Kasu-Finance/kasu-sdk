import WithdrawalRequestTransactionsTableRow from '@/components/organisms/lending/OverviewTab/WithdrawalRequestTransactions/WithdrawalRequestTransactionsTable/WithdrawalRequestTransactionsTableRow'

import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type WithdrawalRequestTransactionsTableBodyProps = {
  withdrawalTransactions: WithdrawalTransactionWrapper[]
  currentEpoch: string
}

const WithdrawalRequestTransactionsTableBody: React.FC<
  WithdrawalRequestTransactionsTableBodyProps
> = ({ withdrawalTransactions, currentEpoch }) => {
  return withdrawalTransactions.map((transaction, index) => (
    <WithdrawalRequestTransactionsTableRow
      currentEpoch={currentEpoch}
      transactionWrapper={transaction}
      key={index}
    />
  ))
}

export default WithdrawalRequestTransactionsTableBody
