import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import useKasuSDK from '@/hooks/useKasuSDK'

import generateKycSignature from '@/actions/generateKycSignature'

import { HexString } from '@/types/lending'

interface KycSignatureData {
  blockExpiration: number
  signature: string
}

const useGenerateKycSignature = () => {
  const [kycData, setKycData] = useState<KycSignatureData | null>(null)

  const { account, chainId } = useWeb3React()
  const sdk = useKasuSDK()

  useEffect(() => {
    const fetchKycSignature = async () => {
      if (!account || !chainId) {
        return
      }

      try {
        const kycSignatureParams =
          await sdk.UserLending.buildKycSignatureParams(
            account as HexString,
            chainId.toString()
          )

        const kycSignatureData = await generateKycSignature(kycSignatureParams)
        if (kycSignatureData) {
          setKycData(kycSignatureData)
        } else {
          setKycData(null)
        }
      } catch (err) {
        console.error('Failed to generate KYC signature:', err)
      }
    }

    fetchKycSignature()
  }, [account, chainId, sdk])

  return { kycData }
}

export default useGenerateKycSignature
