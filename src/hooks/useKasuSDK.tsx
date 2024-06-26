import { KasuSdk } from '@solidant/kasu-sdk'
import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'

import sdkConfig from '@/config/sdk'

const useKasuSDK = () => {
  const { provider, account } = useWeb3React()

  const { data: unusedPools } = useSWRImmutable('unusedPools', async () => {
    const res = await fetch('/api/getUnusedLendingPools')

    const data: string[] = await res.json()

    return data
  })

  const { data, error } = useSWR('kasuSDK', async () => {
    if (!provider || !account) return

    return new KasuSdk(
      { ...sdkConfig, UNUSED_LENDING_POOL_IDS: unusedPools! },
      provider.getSigner()
    )
  })

  if (error) {
    console.error(error)
  }

  return data!
}

export default useKasuSDK
