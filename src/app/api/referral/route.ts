import { NextRequest } from 'next/server'

import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'
import { getRequiredEnv } from '@/utils/env'

export type ReferralMessageRes =
  | {
      message: string
    }
  | {
      error: string
      message: string
      statusCode: number
    }

export type VerifyReferralPayload = {
  owner: string
  refferer: string
  signature: string
}

export type VerifyReferralRes = {
  isValid: boolean
  message: string
  error?: string
}

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams

  const chainId = queryParams.get('chainId')
  const userAddress = queryParams.get('userAddress')
  const referralCode = queryParams.get('referralCode')

  if (!chainId || !userAddress || !referralCode) {
    return Response.json({ message: 'Missing Parameters' }, { status: 400 })
  }

  const chain = parseInt(chainId)

  if (!isSupportedChain(chain)) {
    return Response.json(
      { message: 'ChainId is not supported' },
      { status: 400 }
    )
  }

  const res = await fetch(
    `${LENDERS_AGREEMENT_API}/referrals/message/${referralCode.toLowerCase()}/${userAddress.toLowerCase()}/`,

    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getRequiredEnv('LENDERS_AGREEMENT_API_KEY'),
        'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain],
      },
    }
  )

  const data = await res.json()

  return Response.json(data)
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

  const body: VerifyReferralPayload = await req.json()

  if (!body.owner || !body.signature || !body.refferer) {
    return Response.json(
      { message: 'Missing Parameters in request body' },
      { status: 400 }
    )
  }

  const res = await fetch(`${LENDERS_AGREEMENT_API}/referrals/verify`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getRequiredEnv('LENDERS_AGREEMENT_API_KEY'),
      'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain],
    },
    method: 'POST',
    body: JSON.stringify(body),
  })

  const data: VerifyReferralRes = await res.json()

  return Response.json(data)
}
