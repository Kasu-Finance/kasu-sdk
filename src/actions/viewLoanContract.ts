'use server'

import { FundingConsentGenerateContractRes } from '@/app/api/lender-agreements/route'
import {
  LENDERS_AGREEMENT_API,
  LENDERS_AGREEMENT_CHAIN_ID_MAP,
} from '@/config/api.lendersAgreement'
import { isSupportedChain } from '@/utils'
import { getRequiredEnv } from '@/utils/env'

type ViewLoanContractPayload = {
  address: string
  signature: string
  id: string
  timestamp: EpochTimeStamp
}

const getLoanContracts = async (
  payload: ViewLoanContractPayload,
  chainId: number
) => {
  if (!isSupportedChain(chainId)) {
    throw new Error('ChainID is not supported')
  }

  const res = await fetch(`${LENDERS_AGREEMENT_API}/contract/resolve`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getRequiredEnv('LENDERS_AGREEMENT_API_KEY'),
      'x-chain-id': LENDERS_AGREEMENT_CHAIN_ID_MAP[chainId],
    },
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const data: FundingConsentGenerateContractRes = await res.json()

  return data
}

export default getLoanContracts
