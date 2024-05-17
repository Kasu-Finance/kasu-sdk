import { Card, CardContent, Grid } from '@mui/material'
import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import TrancheCard from '@/components/molecules/lending/overview/TranchCard'

import { COLS } from '@/constants'
import { sortTranches } from '@/utils'

interface TranchesDetailsProps {
  pool: PoolOverview
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
