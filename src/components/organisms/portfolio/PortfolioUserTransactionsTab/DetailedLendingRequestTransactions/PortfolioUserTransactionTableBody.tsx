import PortfolioUserTransactionTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/PortfolioUserTransactionTableRow'

import { DetailedTransactionWrapper } from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionTableBodyProps = {
  detailedTransactions: DetailedTransactionWrapper[]
  currentEpoch: string
}

const PortfolioUserTransactionTableBody: React.FC<
  PortfolioUserTransactionTableBodyProps
> = ({ detailedTransactions, currentEpoch }) => {
  return detailedTransactions.map((transaction, index) => (
    <PortfolioUserTransactionTableRow
      currentEpoch={currentEpoch}
      transactionWrapper={transaction}
      key={index}
    />
  ))
}

export default PortfolioUserTransactionTableBody
