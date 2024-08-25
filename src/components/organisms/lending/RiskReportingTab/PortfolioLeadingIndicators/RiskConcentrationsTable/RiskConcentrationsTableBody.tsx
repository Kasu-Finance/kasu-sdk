import { TableCell, TableRow } from '@mui/material'

import { formatAmount } from '@/utils'

import data from './data.json'

const RiskConcentrationsTableBody = () => {
  return data.riskConcentrations.map((risk, index) => (
    <TableRow key={index}>
      {risk.map((item, index) => (
        <TableCell key={index}>
          {index === 0
            ? item
            : `${formatAmount(item, { minDecimals: 2 })} USDC`}
        </TableCell>
      ))}
    </TableRow>
  ))
}

export default RiskConcentrationsTableBody
