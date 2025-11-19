import { NextRequest, NextResponse } from 'next/server'

import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'
import { getRequiredEnv } from '@/utils/env'

export type UserAirDropTicket = {
  totalTickets: number
  results: {
    userAddress: string
    poolAddress: string
    totalAcceptedInEpoch: number
    epochId: number
    epochDate: EpochTimeStamp
    ticketOrder: string
    requestId: string
  }[]
}

type UserAirDropTicketsReturn =
  | {
      statusCode: number
      message: string
    }
  | UserAirDropTicket

export async function GET(req: NextRequest) {
  try {
    const queryParams = req.nextUrl.searchParams

    const chainId = queryParams.get('chainId')

    if (!chainId) {
      return Response.json({ message: 'ChainId is missing' }, { status: 400 })
    }

    const chain = parseInt(chainId)
    if (!isSupportedChain(chain)) {
      return Response.json(
        { message: 'ChainId is not supported' },
        { status: 400 }
      )
    }

    const res = await fetch(`${LENDERS_AGREEMENT_API}/user-airdrop/tickets`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getRequiredEnv('LENDERS_AGREEMENT_API_KEY'),
        'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain],
      },
    })

    const airDropTickets: UserAirDropTicketsReturn = await res.json()

    if ('statusCode' in airDropTickets) {
      return NextResponse.json(airDropTickets.message, {
        status: airDropTickets.statusCode,
      })
    }

    return NextResponse.json(airDropTickets, { status: 200 })
  } catch (error) {
    console.error('API call error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
