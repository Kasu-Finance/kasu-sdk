import { Card, CardContent, Grid } from '@mui/material'
import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import TranchDetailCard from '@/components/molecules/TranchDetailCard'

import { COLS } from '@/constants'
import { formatAmount, sortTranches } from '@/utils'

interface TranchesDetailsProps {
  pool: PoolOverview
}

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

const TranchesDetails: React.FC<TranchesDetailsProps> = ({ pool }) => {
  const sortedTranches = useMemo(
    () => sortTranches(pool.tranches as TrancheData[]),
    [pool.tranches]
  )
  const trancheCount = sortedTranches.length
  const columnWidth = COLS / trancheCount
  const isSingleTranche = trancheCount === 1

  return (
    <Card>
      <CardContent>
        <Grid container columnSpacing={3} rowGap={2}>
          {sortedTranches.map((tranche) => (
            <TrancheCard
              key={tranche.id}
              tranche={tranche}
              isSingleTranche={isSingleTranche}
              columnWidth={columnWidth}
            />
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TranchesDetails
