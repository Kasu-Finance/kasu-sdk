import { NextRequest } from 'next/server'

import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'

export type UserReferralYieldRes =
  | {
      items: {
        poolAddress: string
        refferantAddress: string
        reffereeAddress: string
        epochId: string
        refferralYield: string
      }[]
      totalUserReferralsCount: number
    }
  | {
      error: string
      message: string
      statusCode: number
    }

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams

  const chainId = queryParams.get('chainId')
  const userAddress = queryParams.get('userAddress')

  if (!chainId || !userAddress) {
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
    `${LENDERS_AGREEMENT_API}/referrals/user/${userAddress.toLowerCase()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LENDERS_AGREEMENT_API_KEY || '',
        'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain] || '',
      },
    }
  )

  const data: UserReferralYieldRes = await res.json()

  return Response.json(data)
}
