'use server'

import NEXERA_API_BASE_URL from '@/config/api.nexera'

type ApiRes =
  | {
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

const generateKycSignature = async (params: {
  contractAbi: readonly unknown[]
  contractAddress: string
  functionName: string
  args: unknown[]
  userAddress: `0x${string}`
  chainId: string
}) => {
  const response = await fetch(
    `${NEXERA_API_BASE_URL}/customer/get-tx-auth-signature`,
    {
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
      },
      method: 'POST',
    }
  )

  const data: ApiRes = await response.json()

  if ('signature' in data) {
    return {
      blockExpiration: data.blockExpiration,
      signature: data.signature,
    }
  }

  console.error(data)
}

export default generateKycSignature
