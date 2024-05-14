'use client'

import { Card, CardContent, Grid } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import TranchDetailCard from '@/components/molecules/TranchDetailCard'

import { COLS } from '@/constants'
import { formatAmount, sortTranches } from '@/utils'

const TranchesDetails: React.FC<{ pool: PoolOverview }> = ({ pool }) => {
  const sortedTranches = sortTranches(pool.tranches)

  return (
    <Card>
      <Grid container columnSpacing={3} rowGap={2} component={CardContent}>
        {sortedTranches.length > 0 &&
          sortedTranches.map((tranche, index) => {
            return (
              <Grid item xs={COLS / pool.tranches.length} key={index}>
                <TranchDetailCard
                  title={tranche.name + ' Tranche'}
                  remainingAmount={{
                    pct: formatAmount(
                      parseFloat(tranche.poolCapacityPercentage || '0') * 100
                    ),
                    value: formatAmount(tranche.poolCapacity || '0'),
                  }}
                  minimumDepositAmount={formatAmount(
                    tranche.minimumDeposit || '0'
                  )}
                  maxDepositAmount={formatAmount(tranche.maximumDeposit || '0')}
                />
              </Grid>
            )
          })}
      </Grid>
    </Card>
  )
}

export default TranchesDetails
