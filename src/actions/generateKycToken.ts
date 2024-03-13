'use server'

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

export async function generateKycToken(userAddress: string) {
  const response = await fetch('https://api.nexera.id/kyc/auth/access-token', {
    body: JSON.stringify({ address: userAddress.toLowerCase() }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer 77fd5cc3-a752-4b4e-a772-553a28bcfbba',
    },
    method: 'POST',
  })
  const data: ApiRes = await response.json()

  if ('accessToken' in data) {
    return data.accessToken
  }

  console.error(data)
}
