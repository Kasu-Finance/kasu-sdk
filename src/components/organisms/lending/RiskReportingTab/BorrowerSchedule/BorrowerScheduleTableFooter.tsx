import { TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { formatAmount } from '@/utils'

import type {
  AggregatedBorrowerData,
  AgingBuckets,
} from '@/types/riskReporting'

type BorrowerScheduleTableFooterProps = {
  totals: AggregatedBorrowerData
  agingBuckets: AgingBuckets
}

// Footer row heatmap gradient colors from Figma (slightly different from body rows)
const FOOTER_BUCKET_COLORS = [
  '#EEE0CA', // bucket 0 (oldest)
  '#EFDDC1',
  '#EFDAB9',
  '#F0D7B1',
  '#F1D4A8',
  '#F2D19F',
  '#E4C18F',
  '#D7B180',
  '#C9A170',
  '#BC9160',
  '#B18554',
  '#A87A49', // bucket 11 (newest)
]

// Total Funding column styling
const TOTAL_COLUMN_BG = '#5B5B60'
const TOTAL_COLUMN_TEXT = '#FFFFFF'

const getFooterBucketColor = (
  bucketIndex: number,
  totalBuckets: number
): string => {
  const colorIndex = Math.floor(
    (bucketIndex / totalBuckets) * FOOTER_BUCKET_COLORS.length
  )
  return FOOTER_BUCKET_COLORS[
    Math.min(colorIndex, FOOTER_BUCKET_COLORS.length - 1)
  ]
}

const BorrowerScheduleTableFooter: React.FC<
  BorrowerScheduleTableFooterProps
> = ({ totals, agingBuckets }) => {
  const bucketKeys = Object.keys(agingBuckets || {}).sort(
    (a, b) => Number(a) - Number(b)
  )

  const loansByBucket = totals?.loansByAgingBucket || {}
  const grandTotal = bucketKeys.reduce(
    (sum, key) => sum + (loansByBucket[key] || 0),
    0
  )

  return (
    <TableRow
      sx={{
        height: 50,
        bgcolor: '#F4F4F4',
        '& .MuiTableCell-root': {
          borderTop: '2px solid',
          borderColor: 'gray.main',
          py: 1,
        },
      }}
    >
      <TableCell sx={{ bgcolor: '#F4F4F4' }}>
        <Typography variant='baseMdBold'>Total</Typography>
      </TableCell>
      {bucketKeys.map((key, bucketIndex) => (
        <TableCell
          key={key}
          align='right'
          sx={{ bgcolor: getFooterBucketColor(bucketIndex, bucketKeys.length) }}
        >
          <Typography variant='baseMdBold'>
            {formatAmount(loansByBucket[key] || 0, {
              minDecimals: 0,
              maxDecimals: 0,
            })}
          </Typography>
        </TableCell>
      ))}
      <TableCell
        align='right'
        sx={{ bgcolor: TOTAL_COLUMN_BG, color: TOTAL_COLUMN_TEXT }}
      >
        <Typography variant='baseMdBold' color='inherit'>
          {formatAmount(grandTotal, {
            minDecimals: 0,
            maxDecimals: 0,
          })}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default BorrowerScheduleTableFooter
