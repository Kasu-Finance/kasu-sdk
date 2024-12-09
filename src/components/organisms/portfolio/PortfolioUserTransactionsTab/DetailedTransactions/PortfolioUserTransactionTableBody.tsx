import PortfolioUserTransactionTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableRow'

import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionTableBodyProps = {
  detailedTransactions: DetailedTransaction[]
  currentEpoch: string
}

const PortfolioUserTransactionTableBody: React.FC<
  PortfolioUserTransactionTableBodyProps
> = ({ detailedTransactions, currentEpoch }) => {
  return detailedTransactions.map((transaction, index) => (
    <PortfolioUserTransactionTableRow
      currentEpoch={currentEpoch}
      transaction={transaction}
      key={index}
    />
  ))
}

export default PortfolioUserTransactionTableBody
