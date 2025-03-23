'use server'

import { IKasuAllowListAbi__factory } from '@solidant/kasu-sdk/src/contracts'

import NEXERA_API_BASE_URL from '@/config/nexera/api.nexera'

type ApiRes =
  | {
      signatureData: string
      payload: string
      signature: string
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

const generateKycSignature = async (
  params: {
    contractAbi: IKasuAllowListAbi__factory
    contractAddress: `${string}`
    functionName: string
    args: unknown[]
    userAddress: `${string}`
    chainId: string
  },
  isIndividual: boolean
) => {
  const KYC_WORKFLOW = process.env.KYC_WORKFLOW || ''
  const KYB_WORKFLOW = process.env.KYB_WORKFLOW || ''

  const NEXERA_API_URL =
    process.env.NEXERA_API_URL ||
    `${NEXERA_API_BASE_URL}/customer-tx-auth-signature`

  if (process.env.NODE_ENV === 'production') {
    console.log(NEXERA_API_URL, {
      ...params,
      workflowId: isIndividual ? KYC_WORKFLOW : KYB_WORKFLOW,
    })
  }

  const response = await fetch(NEXERA_API_URL, {
    body: JSON.stringify({
      ...params,
      workflowId: isIndividual ? KYC_WORKFLOW : KYB_WORKFLOW,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
    },
    method: 'POST',
  })

  if (process.env.NODE_ENV === 'production') {
    console.log('response ', response)
  }

  const data: ApiRes = await response.json()

  if (process.env.NODE_ENV === 'production') {
    console.log('data ', data)
  }

  if ('payload' in data) {
    return {
      blockExpiration: data.blockExpiration,
      signature: '0x' + data.payload.substring(64),
    }
  }
}

export default generateKycSignature
