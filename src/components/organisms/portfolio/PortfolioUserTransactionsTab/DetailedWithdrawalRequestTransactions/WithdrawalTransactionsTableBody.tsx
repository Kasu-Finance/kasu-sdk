import WithdrawalTransactionsTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsTableRow'

import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type WithdrawalTransactionsTableBodyProps = {
  withdrawalTransactions: WithdrawalTransactionWrapper[]
  currentEpoch: string
}

const WithdrawalTransactionsTableBody: React.FC<
  WithdrawalTransactionsTableBodyProps
> = ({ withdrawalTransactions, currentEpoch }) => {
  return withdrawalTransactions.map((transaction, index) => (
    <WithdrawalTransactionsTableRow
      currentEpoch={currentEpoch}
      transactionWrapper={transaction}
      key={index}
    />
  ))
}

export default WithdrawalTransactionsTableBody
