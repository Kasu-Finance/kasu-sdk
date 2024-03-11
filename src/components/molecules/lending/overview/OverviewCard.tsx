'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'

import TranchesApyCard from '@/components/molecules/lending/overview/TranchesApyCard'

const OverviewTitle = () => (
  <CardHeader
    title=' Pool Overview'
    titleTypographyProps={{
      variant: 'h6',
      component: 'h6',
      m: 0,
    }}
    action={
      <Button
        variant='contained'
        sx={{ height: '30px', top: 4, right: 8 }}
        size='small'
      >
        Strategy deck
      </Button>
    }
  />
)

const OverviewCard = () => {
  return (
    <Card
      sx={{ minWidth: 275, boxShadow: 3, overflow: 'inherit' }}
      elevation={1}
    >
      <OverviewTitle />
      <CardContent>
        <Typography variant='body1'>
          By engaging in Cash Management, companies can extend runway, hedge
          against inflation, and manage cash flows. The Pool is designed to meet
          the conservative risk profile and daily liquidity needs of DAOs,
          Offshore Companies and Web3 Treasuries. The pool passes yield sourced
          from US Treasury bills and reverse repurchase agreements, less fees of
          0.5% of yield, to Lenders.
        </Typography>

        <TranchesApyCard />
      </CardContent>
    </Card>
  )
}

export default OverviewCard
