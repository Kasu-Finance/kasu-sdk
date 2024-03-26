import { Card, CardContent, Typography } from '@mui/material'

import OverviewTitle from '@/components/molecules/details/OverviewTitle'
import InvestmentPortfolio from '@/components/molecules/lending/overview/InvestmentCard'
import OverviewDetails from '@/components/molecules/lending/overview/OverviewDetails'
import TranchesApyCard from '@/components/molecules/lending/overview/TranchesApyCard'
import TranchesDetailsCard from '@/components/molecules/lending/overview/TranchesDetails'

const PoolOverview = () => {
  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          boxShadow: 3,
          overflow: 'inherit',
        }}
        elevation={1}
      >
        <OverviewTitle />

        <CardContent>
          <Typography variant='body1'>
            By engaging in Cash Management, companies can extend runway, hedge
            against inflation, and manage cash flows. The Pool is designed to
            meet the conservative risk profile and daily liquidity needs of
            DAOs, Offshore Companies and Web3 Treasuries. The pool passes yield
            sourced from US Treasury bills and reverse repurchase agreements,
            less fees of 0.5% of yield, to Lenders.
          </Typography>
        </CardContent>
        <TranchesApyCard />
      </Card>

      <OverviewDetails />

      <TranchesDetailsCard />
      <InvestmentPortfolio />
    </>
  )
}

export default PoolOverview
