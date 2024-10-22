import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useState } from 'react'

import PortfolioUserTransactionTableRow from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableRow'

type PortfolioUserTransactionTableBodyProps = {
  transactions: UserRequest[]
}

const PortfolioUserTransactionTableBody: React.FC<
  PortfolioUserTransactionTableBodyProps
> = ({ transactions }) => {
  const [collapsed, setCollapsed] = useState<number | undefined>(undefined)

  const handleCollapse = (index: number) => {
    setCollapsed((prev) => (prev === index ? undefined : index))
  }

  return transactions.map((transaction, index) => (
    <PortfolioUserTransactionTableRow
      transaction={transaction}
      isActive={collapsed === index}
      toggle={() => handleCollapse(index)}
      key={transaction.id}
    />
  ))
}

export default PortfolioUserTransactionTableBody
