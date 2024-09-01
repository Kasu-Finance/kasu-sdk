import { Box, TableCell, TableRow } from '@mui/material'
import { BadAndDoubtfulDebts } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import ToolTip from '@/components/atoms/ToolTip'

import { formatAmount, isNumber } from '@/utils'

type BadAndDoubtfulDebtsTableBodyProps = {
  badAndDoubltfulDebts: BadAndDoubtfulDebts
}

const BadAndDoubtfulDebtsTableBody: React.FC<
  BadAndDoubtfulDebtsTableBodyProps
> = ({ badAndDoubltfulDebts }) => {
  return badAndDoubltfulDebts.items.map((debtItem, index) => (
    <TableRow key={index}>
      <TableCell>
        <Box display='flex' alignItems='center'>
          {debtItem.item.name}
          {debtItem.item.tooltip && <ToolTip title={debtItem.item.tooltip} />}
        </Box>
      </TableCell>
      <TableCell>
        {isNumber(debtItem.totalLifetimeAmount)
          ? `${formatAmount(debtItem.totalLifetimeAmount, { minDecimals: 2 })} ${debtItem.item.unit ?? 'USDC'}`
          : 'N/A'}
      </TableCell>
      <TableCell>
        {isNumber(debtItem.totalLifetimePercentage)
          ? `${formatAmount(debtItem.totalLifetimePercentage, { minDecimals: 2 })} ${debtItem.item.unit ?? '%'}`
          : 'N/A'}
      </TableCell>
      <TableCell>
        {isNumber(debtItem.monthlyAverageAmount)
          ? `${formatAmount(debtItem.monthlyAverageAmount, { minDecimals: 2 })} ${debtItem.item.unit ?? 'USDC'}`
          : 'N/A'}
      </TableCell>
      <TableCell>
        {isNumber(debtItem.monthlyAveragePercentage)
          ? `${formatAmount(debtItem.monthlyAveragePercentage, { minDecimals: 2 })} ${debtItem.item.unit ?? '%'}`
          : 'N/A'}
      </TableCell>
      <TableCell>
        {isNumber(debtItem.currentAmount)
          ? `${formatAmount(debtItem.currentAmount, { minDecimals: 2 })} ${debtItem.item.unit ?? 'USDC'}`
          : 'N/A'}
      </TableCell>
      <TableCell>
        {isNumber(debtItem.currentPercentage)
          ? `${formatAmount(debtItem.currentPercentage, { minDecimals: 2 })} ${debtItem.item.unit ?? '%'}`
          : 'N/A'}
      </TableCell>
    </TableRow>
  ))
}

export default BadAndDoubtfulDebtsTableBody
