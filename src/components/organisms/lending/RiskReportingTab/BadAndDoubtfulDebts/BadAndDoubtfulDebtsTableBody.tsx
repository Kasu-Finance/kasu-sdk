import { BadAndDoubtfulDebts } from '@kasufinance/kasu-sdk'
import { Box, TableCell, TableRow, Typography } from '@mui/material'
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
        <Box display='flex'>
          <Typography variant='inherit' flex={1}>
            {isNumber(debtItem.totalLifetimeAmount)
              ? `${formatAmount(debtItem.totalLifetimeAmount, { minDecimals: 2 })} ${debtItem.item.unit ?? 'USDC'}`
              : 'N/A'}
          </Typography>
          <Typography variant='inherit' width='70px'>
            {isNumber(debtItem.totalLifetimePercentage)
              ? `${formatAmount(debtItem.totalLifetimePercentage, { minDecimals: 2 })} ${debtItem.item.unit ?? '%'}`
              : 'N/A'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display='flex'>
          <Typography variant='inherit' flex={1}>
            {isNumber(debtItem.monthlyAverageAmount)
              ? `${formatAmount(debtItem.monthlyAverageAmount, { minDecimals: 2 })} ${debtItem.item.unit ?? 'USDC'}`
              : 'N/A'}
          </Typography>
          <Typography variant='inherit' width='70px'>
            {isNumber(debtItem.monthlyAveragePercentage)
              ? `${formatAmount(debtItem.monthlyAveragePercentage, { minDecimals: 2 })} ${debtItem.item.unit ?? '%'}`
              : 'N/A'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display='flex'>
          <Typography variant='inherit' flex={1}>
            {isNumber(debtItem.currentAmount)
              ? `${formatAmount(debtItem.currentAmount, { minDecimals: 2 })} ${debtItem.item.unit ?? 'USDC'}`
              : 'N/A'}
          </Typography>
          <Typography variant='inherit' width='70px'>
            {isNumber(debtItem.currentPercentage)
              ? `${formatAmount(debtItem.currentPercentage, { minDecimals: 2 })} ${debtItem.item.unit ?? '%'}`
              : 'N/A'}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  ))
}

export default BadAndDoubtfulDebtsTableBody
