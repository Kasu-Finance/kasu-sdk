'use client'

import { Card, CardContent, Grid } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import TranchDetailCard from '@/components/molecules/TranchDetailCard'

import { COLS } from '@/constants'
import { formatAmount, sortTranches } from '@/utils'

const remainingAmount = (maxAmount: string, currentAmount: string) => {
  const amountLeft = +maxAmount - +currentAmount

  const amountPct = (amountLeft / +maxAmount) * 100

  return {
    value: formatAmount(amountLeft),
    pct: formatAmount(amountPct),
  }
}

const TranchesDetails: React.FC<{ pool: PoolOverview }> = ({ pool }) => {
  const sortedTranches = sortTranches(pool.tranches)

  return (
    <Card sx={{ mt: 3 }}>
      <Grid container columnSpacing={3} rowGap={2} component={CardContent}>
        {sortedTranches.length > 0 &&
          sortedTranches.map((tranche, index) => {
            return (
              <Grid item xs={COLS / pool.tranches.length} key={index}>
                <TranchDetailCard
                  title={tranche.name + ' Tranche'}
                  remainingAmount={remainingAmount(
                    tranche.maximumDeposit,
                    tranche.poolCapacity
                  )}
                  minimumDepositAmount={formatAmount(tranche.minimumDeposit)}
                  maxDepositAmount={formatAmount(tranche.maximumDeposit)}
                />
              </Grid>
            )
          })}
      </Grid>
    </Card>
  )
}

export default TranchesDetails
