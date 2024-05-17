'use client'

import { Box, Typography } from '@mui/material'
import React from 'react'

import TrancheMetricDisplay from '@/components/molecules/TrancheMetricDisplay'

interface TranchDetailCardProps {
  title: string
  remainingAmount: { pct: string; value: string }
  minimumDepositAmount: string
  maxDepositAmount: string
  isSingleTranche?: boolean
}

const TranchDetailCard: React.FC<TranchDetailCardProps> = ({
  title,
  remainingAmount,
  minimumDepositAmount,
  maxDepositAmount,
  isSingleTranche,
}) => {
  return (
    <Box
      className='light-colored-background'
      sx={{
        minWidth: 275,
        margin: 0,
        p: 0,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: isSingleTranche ? 'row' : 'column',
      }}
    >
      {title && (
        <Typography
          sx={{ pl: 2, pt: 2, pb: 1 }}
          variant='subtitle1'
          component='h6'
        >
          {title}
        </Typography>
      )}

      <TrancheMetricDisplay
        titleKey='lending.poolOverview.trancheCard.remainingCapacity.label'
        tooltipKey='lending.poolOverview.trancheCard.remainingCapacity.tooltip'
        content={remainingAmount.pct}
        additionalContent={remainingAmount.value}
        suffix='USDC'
        isSingleTranche={isSingleTranche}
        isRemainingCapacity
      />
      <TrancheMetricDisplay
        titleKey='Minimum Deposit Amount'
        tooltipKey=''
        content={minimumDepositAmount}
        suffix='USDC'
        isSingleTranche={isSingleTranche}
      />
      <TrancheMetricDisplay
        titleKey='Maximum Deposit Amount'
        tooltipKey=''
        content={maxDepositAmount}
        suffix='USDC'
        isLast={true}
        isSingleTranche={isSingleTranche}
      />
    </Box>
  )
}

export default TranchDetailCard
