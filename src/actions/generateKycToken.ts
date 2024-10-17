'use server'

import NEXERA_API_BASE_URL from '@/config/nexera/api.nexera'

type ApiRes =
  | {
      accessToken: string
    }
  | {
      message: string
      code: string
      issues: [
        {
          code: string
          expected: string
          received: string
          path: string[]
          message: string
        },
      ]
    }

const generateKycToken = async (userAddress: string) => {
  const response = await fetch(`${NEXERA_API_BASE_URL}/kyc/auth/access-token`, {
    body: JSON.stringify({ address: userAddress.toLowerCase() }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
    },
    method: 'POST',
  })
  const data: ApiRes = await response.json()

  if ('accessToken' in data) {
    return data.accessToken
  }

  console.error(data)
}

export default generateKycToken
