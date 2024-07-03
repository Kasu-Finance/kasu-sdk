import useSWRImmutable from 'swr/immutable'

const fetchPoolOverview = async (url: string) => {
  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch pool overview')
  }

  return data.poolOverview
}

const usePoolOverview = (poolId?: string) => {
  const poolQuery = poolId ? `?id=${poolId}` : ''

  const { data, error } = useSWRImmutable(
    `/api/pools${poolQuery}`,
    fetchPoolOverview
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default usePoolOverview
