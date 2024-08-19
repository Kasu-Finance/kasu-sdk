'use client'

import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useState } from 'react'

import UserTransactionTableRow from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx/UserTransactionTableRow'

type UserTransactionTableBodyProps = {
  transactions: UserRequest[]
}

const UserTransactionTableBody: React.FC<UserTransactionTableBodyProps> = ({
  transactions,
}) => {
  const [collapsed, setCollapsed] = useState<number | undefined>(undefined)

  const handleCollapse = (index: number) => {
    setCollapsed((prev) => (prev === index ? undefined : index))
  }

  return transactions.map((transaction, index) => (
    <UserTransactionTableRow
      transaction={transaction}
      isActive={collapsed === index}
      toggle={() => handleCollapse(index)}
      key={transaction.id}
    />
  ))
}

export default UserTransactionTableBody
