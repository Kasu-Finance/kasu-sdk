import PortfolioUserTransactionTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableRow'

import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionTableBodyProps = {
  detailedTransactions: DetailedTransaction[]
}

const PortfolioUserTransactionTableBody: React.FC<
  PortfolioUserTransactionTableBodyProps
> = ({ detailedTransactions: transactions }) => {
  return transactions.map((transaction, index) => (
    <PortfolioUserTransactionTableRow transaction={transaction} key={index} />
  ))
}

export default PortfolioUserTransactionTableBody
