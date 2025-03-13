import { unstable_cache } from 'next/cache'

import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'

const CACHE_TTL = 60 * 60 // 1 hour

type ViewLoanContractPayload = {
  address: string
  signature: string
  id: string
  timestamp: EpochTimeStamp
}

export const getLoanContracts = unstable_cache(
  async (payload: ViewLoanContractPayload, chainId: number) => {
    if (!isSupportedChain(chainId)) {
      return Response.json(
        { message: 'ChainId is not supported' },
        { status: 400 }
      )
    }

    const res = await fetch(`${LENDERS_AGREEMENT_API}/contract/resolve`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LENDERS_AGREEMENT_API_KEY || '',
        'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chainId] || '',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return res.json()
  },
  ['loanContracts'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['loanContracts'],
    revalidate: CACHE_TTL,
  }
)
