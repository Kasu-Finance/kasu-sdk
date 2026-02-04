import type { KasuSdk } from '@kasufinance/kasu-sdk'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import NftMetadata from '@/config/nfts.json'

export type NftDetail = {
  name: string
  description: string
  image: string
  boostAmount: number
  attributes: (
    | {
        trait_type: 'Type'
        value: 'Kappa' | 'Kitsune' | 'Tengu' | 'Ryujin' | 'Yurei'
      }
    | {
        trait_type: 'Rarity'
        value: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
      }
  )[]
}

type UseUserNftsOptions = {
  enabled?: boolean
  sdk?: KasuSdk
}

const useUserNfts = (options?: UseUserNftsOptions) => {
  const sdkFromContext = useSdk()
  const sdk = options?.sdk ?? sdkFromContext
  const { currentChainId } = useChain()

  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && sdk ? ['userNfts', currentChainId, address] : null,
    async (): Promise<NftDetail[]> => {
      const [nftIds, nftBoosts] = await Promise.all([
        sdk!.Portfolio.getUserNfts(address!.toLowerCase()),
        sdk!.DataService.getNftBoost(),
      ])

      const nftWithFallback = nftIds
        .map((id) => {
          const nftDetail = NftMetadata[
            id.toString() as keyof typeof NftMetadata
          ] as Omit<NftDetail, 'boostAmount'> | undefined

          if (!nftDetail) {
            const ipfsPromise: Promise<
              Omit<NftDetail, 'boostAmount'> | undefined
            > = fetch(
              `https://ipfs.io/ipfs/bafybeido6pbiisvqbgnvmc3ecpyquk3p67wewyq7npjq3fokopjw7j7xpm/${id}.json`
            ).then((res) => res.json())

            return ipfsPromise
          }

          const nftType = nftDetail.attributes.find(
            (attr) => attr.trait_type === 'Type'
          )

          if (!nftType) return null

          const boostAmount =
            nftBoosts[nftType.value.toLowerCase() as keyof typeof nftBoosts]

          return {
            ...nftDetail,
            boostAmount,
          }
        })
        .filter((nft) => nft !== null)

      const resolveFallback = await Promise.all(nftWithFallback)

      return resolveFallback
        .map((nft) => {
          if (!nft) return null

          if ('boostAmount' in nft) return nft

          const nftType = nft.attributes.find(
            (attr) => attr.trait_type === 'Type'
          )

          if (!nftType) return null

          const boostAmount =
            nftBoosts[nftType.value.toLowerCase() as keyof typeof nftBoosts]

          return {
            ...nft,
            boostAmount,
          }
        })
        .filter((nft) => nft !== null)
    },
    {
      errorRetryCount: 5,
    }
  )

  return {
    userNfts: data,
    error,
    isLoading:
      enabled && Boolean(address) && (!sdk || isLoading || (!data && !error)),
    updateUserNfts: mutate,
  }
}

export default useUserNfts
