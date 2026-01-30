import { TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { formatAmount } from '@/utils'

import type { AgingBuckets, BorrowerData } from '@/types/riskReporting'

type BorrowerScheduleTableBodyProps = {
  borrowers: BorrowerData[]
  agingBuckets: AgingBuckets
}

// Heatmap gradient colors from Figma (oldest/lightest to newest/darkest)
const BUCKET_COLORS = [
  '#FDF8F0', // bucket 0 (oldest)
  '#FDF5E7',
  '#FEF1DC',
  '#FEEDD1',
  '#FFE9C6',
  '#FFE4BC',
  '#FADCB0',
  '#F0CFA3',
  '#E5C295',
  '#DBB588',
  '#D0A87B',
  '#C69B6E', // bucket 11 (newest)
]

// Total Funding column styling
const TOTAL_COLUMN_BG = '#5B5B60'
const TOTAL_COLUMN_TEXT = '#FFFFFF'

const formatBorrowerId = (id: string): string => {
  // Shorten borrower ID for display (show first and last parts)
  if (id.length > 16) {
    return `${id.slice(0, 8)}...${id.slice(-6)}`
  }
  return id
}

const getBucketColor = (bucketIndex: number, totalBuckets: number): string => {
  // Map bucket index to color index based on total buckets
  const colorIndex = Math.floor(
    (bucketIndex / totalBuckets) * BUCKET_COLORS.length
  )
  return BUCKET_COLORS[Math.min(colorIndex, BUCKET_COLORS.length - 1)]
}

const BorrowerScheduleTableBody: React.FC<BorrowerScheduleTableBodyProps> = ({
  borrowers,
  agingBuckets,
}) => {
  const bucketKeys = Object.keys(agingBuckets).sort(
    (a, b) => Number(a) - Number(b)
  )

  return (
    <>
      {borrowers.map((borrower, index) => {
        const loansByBucket = borrower.loansByAgingBucket || {}
        const bucketTotal = bucketKeys.reduce(
          (sum, key) => sum + (loansByBucket[key] || 0),
          0
        )

        return (
          <TableRow
            key={borrower.borrowerId || index}
            sx={{ height: 50, '& .MuiTableCell-root': { py: 1 } }}
          >
            <TableCell sx={{ bgcolor: '#FFFFFF' }}>
              <Typography variant='baseSm' title={borrower.borrowerId}>
                {formatBorrowerId(
                  borrower.borrowerId || `Borrower ${index + 1}`
                )}
              </Typography>
            </TableCell>
            {bucketKeys.map((key, bucketIndex) => (
              <TableCell
                key={key}
                align='right'
                sx={{ bgcolor: getBucketColor(bucketIndex, bucketKeys.length) }}
              >
                <Typography variant='baseSm'>
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
              <Typography variant='baseSmBold' color='inherit'>
                {formatAmount(bucketTotal, {
                  minDecimals: 0,
                  maxDecimals: 0,
                })}
              </Typography>
            </TableCell>
          </TableRow>
        )
      })}
    </>
  )
}

export default BorrowerScheduleTableBody
