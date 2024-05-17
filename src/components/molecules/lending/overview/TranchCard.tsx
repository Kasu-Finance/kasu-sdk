import { Grid } from '@mui/material'
import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import TranchDetailCard from '@/components/molecules/TranchDetailCard'

import { formatAmount } from '@/utils'

interface TrancheCardProps {
  tranche: TrancheData
  isSingleTranche: boolean
  columnWidth: number
}

const TrancheCard: React.FC<TrancheCardProps> = ({
  tranche,
  isSingleTranche,
  columnWidth,
}) => {
  const title = isSingleTranche ? '' : `${tranche.name} Tranche`
  const remainingAmountPct = formatAmount(
    parseFloat(tranche.poolCapacityPercentage || '0') * 100
  )
  const remainingAmountValue = formatAmount(tranche.poolCapacity || '0')
  const minimumDepositAmount = formatAmount(tranche.minimumDeposit || '0')
  const maxDepositAmount = formatAmount(tranche.maximumDeposit || '0')

  return (
    <Grid item xs={columnWidth} key={tranche.id}>
      <TranchDetailCard
        title={title}
        isSingleTranche={isSingleTranche}
        remainingAmount={{
          pct: remainingAmountPct,
          value: remainingAmountValue,
        }}
        minimumDepositAmount={minimumDepositAmount}
        maxDepositAmount={maxDepositAmount}
      />
    </Grid>
  )
}

export default TrancheCard
