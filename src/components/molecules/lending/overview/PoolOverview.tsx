import { Card, CardContent, Typography } from '@mui/material'
import { useParams } from 'next/navigation'

import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import OverviewTitle from '@/components/molecules/details/OverviewTitle'
import InvestmentPortfolio from '@/components/molecules/lending/overview/InvestmentCard'
import LoyaltyCard from '@/components/molecules/lending/overview/LoyaltyCard'
import OverviewDetails from '@/components/molecules/lending/overview/OverviewDetails'
import TranchesApyCard from '@/components/molecules/lending/overview/TranchesApyCard'
import TranchesDetailsCard from '@/components/molecules/lending/overview/TranchesDetails'
import TransactionHistory from '@/components/molecules/lending/overview/TransactionHistory'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'

import { getObjectById } from '@/utils'

const PoolOverview = () => {
  const { slug } = useParams()
  const poolId = slug as string
  const overviewPools = usePoolOverview(poolId)
  const delegatePool = usePoolDelegate(poolId)

  const isLoading = overviewPools.isLoading || delegatePool.isLoading
  const hasData = overviewPools.data && delegatePool.data

  let currentPool, currentPoolDelegate

  if (!isLoading && hasData) {
    currentPool = getObjectById(overviewPools.data, poolId)
    currentPoolDelegate = delegatePool.data
  }

  if (isLoading) {
    return (
      <>
        <CardSkeleton leftRowNumbers={4} rightRowNumbers={4} />
        <CardSkeleton leftRowNumbers={3} rightRowNumbers={3} />
        <CardSkeleton leftRowNumbers={3} rightRowNumbers={3} />
        <CardSkeleton leftRowNumbers={3} rightRowNumbers={3} />
        <CardSkeleton leftRowNumbers={5} rightRowNumbers={5} />
      </>
    )
  }

  if (!hasData) {
    return (
      <EmptyCardState message={'No data available for this pool: ' + poolId} />
    )
  }

  if (currentPool && currentPoolDelegate) {
    return (
      <>
        <Card
          sx={{ minWidth: 275, height: 352, boxShadow: 3, overflow: 'inherit' }}
          elevation={1}
        >
          <OverviewTitle />
          <CardContent>
            <Typography variant='body1'>{currentPool.description}</Typography>
          </CardContent>
          <TranchesApyCard pool={currentPool} />
        </Card>
        <OverviewDetails
          pool={currentPool}
          poolDelegate={currentPoolDelegate}
        />
        <TranchesDetailsCard pool={currentPool} />
        <InvestmentPortfolio pool={currentPool} />
        <LoyaltyCard />
        <TransactionHistory />
      </>
    )
  }

  return null
}

export default PoolOverview
