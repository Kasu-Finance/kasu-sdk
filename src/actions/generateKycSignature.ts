'use server'

import { IKasuAllowListAbi__factory } from '@solidant/kasu-sdk/src/contracts'

import NEXERA_API_BASE_URL from '@/config/api.nexera'

type ApiRes =
  | {
      signatureData: string
      blockExpiration: number
      isAuthorized: boolean
    }
  | {
      message: 'string'
      code: 'string'
      issues: [
        {
          message: 'string'
        },
      ]
    }

const generateKycSignature = async (params: {
  contractAbi: IKasuAllowListAbi__factory
  contractAddress: `${string}`
  functionName: string
  args: unknown[]
  userAddress: `${string}`
  chainId: string
}) => {
  const NEXERA_API_URL =
    process.env.NEXERA_API_URL ||
    `${NEXERA_API_BASE_URL}/customer-tx-auth-signature`

  const response = await fetch(NEXERA_API_URL, {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
    },
    method: 'POST',
  })

  const data: ApiRes = await response.json()

  if ('signatureData' in data) {
    return {
      blockExpiration: data.blockExpiration,
      signature: data.signatureData,
    }
  }
}

export default generateKycSignature
