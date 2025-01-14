import { NextRequest } from 'next/server'

import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'

export type FundingConsentGenerateContractPayoad = {
  address: string
  signature: string
  timestamp: EpochTimeStamp
}

export type FundingConsentGenerateContractRes = {
  fullName: string
  contractMessage: string
  formattedMessage: string
  contractType: 'retail' | 'exempt'
  contractVersion: number
  timestamp: EpochTimeStamp
}

export async function POST(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams

  const chainId = queryParams.get('chainId')

  if (!chainId) {
    return Response.json({ message: 'Missing Parameters' }, { status: 400 })
  }

  const chain = parseInt(chainId)

  if (!isSupportedChain(chain)) {
    return Response.json(
      { message: 'ChainId is not supported' },
      { status: 400 }
    )
  }

  const body: FundingConsentGenerateContractPayoad = await req.json()

  if (!body.address || !body.signature || !body.timestamp) {
    return Response.json(
      { message: 'Missing Parameters in request body' },
      { status: 400 }
    )
  }

  const res = await fetch(`${LENDERS_AGREEMENT_API}/contract/generate`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LENDERS_AGREEMENT_API_KEY || '',
      'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain] || '',
    },
    method: 'POST',
    body: JSON.stringify(body),
  })

  const data: FundingConsentGenerateContractRes = await res.json()

  return Response.json(data)
}
