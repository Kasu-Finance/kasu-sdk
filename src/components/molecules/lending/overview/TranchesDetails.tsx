'use client'

import { Card, CardContent, Grid } from '@mui/material'

import TranchDetailCard from '@/components/molecules/TranchDetailCard'

const TranchesDetails = () => {
  const COLS = 12
  const tranches = [
    {
      title: 'Senior Tranche',
      remainingAmount: { pct: '15', value: '10,000.00' },
      minimumDepositAmount: '4.50',
      maxDepositAmount: '1,0 M',
    },
    {
      title: 'Mezzanine Tranche',
      remainingAmount: { pct: '15', value: '10,000.00' },
      minimumDepositAmount: '4.50',
      maxDepositAmount: '1,0 M',
    },
    {
      title: 'Junior Tranche',
      remainingAmount: { pct: '15', value: '10,000.00' },
      minimumDepositAmount: '4.50',
      maxDepositAmount: '1,0 M',
    },
  ]

  return (
    <Card sx={{ mt: 3 }}>
      <Grid container columnSpacing={3} rowGap={2} component={CardContent}>
        {tranches.length > 0 &&
          tranches.map((tranche, index) => {
            return (
              <Grid item xs={COLS / tranches.length} key={index}>
                <TranchDetailCard
                  title={tranche.title}
                  remainingAmount={tranche.remainingAmount}
                  minimumDepositAmount={tranche.minimumDepositAmount}
                  maxDepositAmount={tranche.maxDepositAmount}
                />
              </Grid>
            )
          })}
      </Grid>
    </Card>
  )
}

export default TranchesDetails
