// src/app/lending/page.js
import { Container } from '@mui/material'

import ClientError from '@/components/atoms/ClientError'
import HomeStatsCard from '@/components/molecules/home/HomeStatsCard'
import LendingSkeleton from '@/components/molecules/loaders/LendingSkeleton'
import HomeTabs from '@/components/organisms/home/HomeTabs'

import { getPoolsTotals } from '@/app/api/lendingTotal/route'
import { getPoolDelegate } from '@/app/api/poolDelegate/route'
import { getPoolOverview } from '@/app/api/pools/route'

export const dynamic = 'force-dynamic'

const LendingPage = async () => {
  let pools, poolDelegates, lendingTotals
  let error: string | null = null

  try {
    ;[pools, poolDelegates] = await Promise.all([
      getPoolOverview(),
      getPoolDelegate(),
    ])

    lendingTotals = await getPoolsTotals(pools)
  } catch (err) {
    console.error('SERVER ERROR:', err)
    if (err instanceof Error) {
      error = err.message
    } else {
      error = String(err)
    }
    return (
      <>
        <LendingSkeleton />
        <ClientError error={error} />
      </>
    )
  }

  return (
    <Container maxWidth='lg'>
      {lendingTotals && <HomeStatsCard data={lendingTotals} />}

      {pools && poolDelegates && (
        <HomeTabs pools={pools} poolDelegates={poolDelegates} />
      )}
    </Container>
  )
}

export default LendingPage
