import { NextRequest, NextResponse } from 'next/server'

import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
  LoanTicketDto,
  LoanTicketRes,
  LoanTicketStatus,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'

export type FundingConsentPayload = {
  userID: string
  payload: {
    endBorrowerID: string
    poolID: string
    trancheID: string
    status: LoanTicketStatus.optedIn | LoanTicketStatus.optedOut
  }

  signature: string
  signatureTimestamp: EpochTimeStamp
}

export type FundingConsentReturn =
  | {
      statusCode: number
      message: string
    }
  | LoanTicketDto[]

export async function POST(req: NextRequest) {
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

    const body: FundingConsentPayload = await req.json()

    if (
      !body.payload ||
      !body.signature ||
      !body.signatureTimestamp ||
      !body.userID
    ) {
      return Response.json(
        { message: 'Missing Parameters in request body' },
        { status: 400 }
      )
    }

    // transforms payload into an array
    const data = { ...body, payload: [body.payload] }

    const res = await fetch(
      `${LENDERS_AGREEMENT_API}/allocations/user-funding-consent`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.LENDERS_AGREEMENT_API_KEY || '',
          'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain] || '',
        },
        method: 'POST',
        body: JSON.stringify(data),
      }
    )

    const newTicketEvents: FundingConsentReturn = await res.json()

    if ('statusCode' in newTicketEvents) {
      return NextResponse.json(newTicketEvents.message, {
        status: newTicketEvents.statusCode,
      })
    }

    return NextResponse.json(newTicketEvents, { status: 200 })
  } catch (error) {
    console.error('API call error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
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
    `${LENDERS_AGREEMENT_API}/allocations/loan-tickets?` +
      new URLSearchParams({
        userID: userAddress,
      }),
    {
      headers: {
        'x-api-key': process.env.LENDERS_AGREEMENT_API_KEY || '',
        'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chain] || '',
      },
    }
  )

  const data: LoanTicketRes = await res.json()

  console.log(data)

  return Response.json(data.items)
}
