import { Card, CardContent, Typography } from '@mui/material'
import { useParams } from 'next/navigation'

import usePoolOverview from '@/hooks/lending/usePoolOverview'

import OverviewTitle from '@/components/molecules/details/OverviewTitle'
import InvestmentPortfolio from '@/components/molecules/lending/overview/InvestmentCard'
import LoyaltyCard from '@/components/molecules/lending/overview/LoyaltyCard'
import OverviewDetails from '@/components/molecules/lending/overview/OverviewDetails'
import TranchesApyCard from '@/components/molecules/lending/overview/TranchesApyCard'
import TranchesDetailsCard from '@/components/molecules/lending/overview/TranchesDetails'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'

import { getObjectById } from '@/utils'

const PoolOverview = () => {
  const { slug } = useParams()
  const poolId = slug as string
  const overviewPools = usePoolOverview(poolId)
  // const delegateHook = usePoolDelegate(poolId)

  let currentPool = undefined
  const isLoading = overviewPools.isLoading

  if (!isLoading) {
    currentPool = getObjectById(overviewPools.data, poolId)
    // console.log('current pool', currentPool)
  }

  // console.log('delegate', delegateHook.data)

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

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          height: 352,
          boxShadow: 3,
          overflow: 'inherit',
        }}
        elevation={1}
      >
        <OverviewTitle />

        <CardContent>
          <Typography variant='body1'>
            {currentPool && currentPool.description}
          </Typography>
        </CardContent>
        {currentPool && <TranchesApyCard pool={currentPool} />}
      </Card>

      {currentPool && <OverviewDetails pool={currentPool} />}
      <TranchesDetailsCard />
      <InvestmentPortfolio />
      <LoyaltyCard />
    </>
  )
}

export default PoolOverview
