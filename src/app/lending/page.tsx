// src/app/lending/page.js
import { Container } from '@mui/material'

import ClientError from '@/components/atoms/ClientError'
import HomeStatsCard from '@/components/molecules/home/HomeStatsCard'
import LendingSkeleton from '@/components/molecules/loaders/LendingSkeleton'
import HomeTabs from '@/components/organisms/home/HomeTabs'

import { getHostUrl } from '@/actions/getHostUrl'

export const dynamic = 'force-dynamic'

const fetchPools = async (baseUrl: string) => {
  const url = `${baseUrl}/api/pools`
  const response = await fetch(`${baseUrl}/api/pools`, {
    cache: 'default',
  })
  if (!response.ok)
    throw new Error(
      'Failed to fetch pools, URL: ' +
        url +
        ' JSON: ' +
        JSON.stringify(response)
    )
  return response.json()
}

const fetchPoolDelegates = async (baseUrl: string) => {
  const url = `${baseUrl}/api/poolDelegate`
  const response = await fetch(`${baseUrl}/api/poolDelegate`, {
    cache: 'default',
  })
  if (!response.ok)
    throw new Error(
      'Failed to fetch pools, URL: ' +
        url +
        ' JSON: ' +
        JSON.stringify(response)
    )
  return response.json()
}

const fetchLendingTotals = async (baseUrl: string) => {
  const url = `${baseUrl}/api/lendingTotal`
  const response = await fetch(`${baseUrl}/api/lendingTotal`, {
    cache: 'default',
  })
  if (!response.ok)
    throw new Error(
      'Failed to fetch pools, URL: ' +
        url +
        ' JSON: ' +
        JSON.stringify(response)
    )
  return response.json()
}

const LendingPage = async () => {
  let pools, poolDelegates, lendingTotals
  let error: string | null = null

  const baseUrl = await getHostUrl()

  console.warn('BASE URL', baseUrl)

  try {
    ;[pools, poolDelegates, lendingTotals] = await Promise.all([
      fetchPools(baseUrl),
      fetchPoolDelegates(baseUrl),
      fetchLendingTotals(baseUrl),
    ])
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
        <HomeTabs pools={pools.poolOverview} poolDelegates={poolDelegates} />
      )}
    </Container>
  )
}

export default LendingPage
