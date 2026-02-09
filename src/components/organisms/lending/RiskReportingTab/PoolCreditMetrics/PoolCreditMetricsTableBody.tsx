import { PoolCreditMetrics } from '@kasufinance/kasu-sdk'
import { Box, TableCell, TableRow } from '@mui/material'
import React from 'react'

import ToolTip from '@/components/atoms/ToolTip'

import { formatAmount } from '@/utils'

type PoolCreditMetricsTableBodyProps = {
  poolCreditMetrics: PoolCreditMetrics
}

const PoolCreditMetricsTableBody: React.FC<PoolCreditMetricsTableBodyProps> = ({
  poolCreditMetrics,
}) =>
  poolCreditMetrics.keyCreditMetrics.map((metrics, index) => (
    <TableRow key={index}>
      <TableCell>
        <Box display='flex' alignItems='center'>
          {metrics.keyCreditMetric.name}
          {metrics.keyCreditMetric.tooltip && (
            <ToolTip title={metrics.keyCreditMetric.tooltip} />
          )}
        </Box>
      </TableCell>
      <TableCell>
        {formatAmount(metrics.previousFiscalYear, { minDecimals: 2 })}{' '}
        {metrics.keyCreditMetric.unit}
      </TableCell>
      <TableCell>
        {formatAmount(metrics.mostRecentQuarter, { minDecimals: 2 })}{' '}
        {metrics.keyCreditMetric.unit}
      </TableCell>
      <TableCell>
        {formatAmount(metrics.priorMonth, { minDecimals: 2 })}{' '}
        {metrics.keyCreditMetric.unit}
      </TableCell>
    </TableRow>
  ))

export default PoolCreditMetricsTableBody
