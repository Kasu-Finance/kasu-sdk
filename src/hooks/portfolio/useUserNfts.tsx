import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

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

const useUserNfts = () => {
  const sdk = useKasuSDK()

  const { account } = useWeb3React()

  const { data, error, isLoading, mutate } = useSWR(
    account && sdk ? ['userNfts', account, sdk] : null,
    async ([_, userAddress, sdk]): Promise<NftDetail[]> => {
      const [nftIds, nftBoosts] = await Promise.all([
        sdk.Portfolio.getUserNfts(userAddress.toLowerCase()),
        sdk.DataService.getNftBoost(),
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
    }
  )

  return {
    userNfts: data,
    error,
    isLoading: isLoading || (!data && !error),
    updateUserNfts: mutate,
  }
}

export default useUserNfts
