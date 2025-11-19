import { getCustomerStatus } from '@compilot/react-sdk'
import { NextRequest } from 'next/server'

import NEXERA_API_BASE_URL, {
  NEXERA_PROJECT_ID,
} from '@/config/nexera/api.nexera'
import { getRequiredEnv } from '@/utils/env'

export type CustomerStatus =
  | Awaited<ReturnType<typeof getCustomerStatus>>
  | 'No Email'

type KybRes =
  | {
      status: CustomerStatus
      companyClaims: {
        email: string
      }[]
    }
  | {
      message: string
      code: string
      traceId: string
    }

type KycRes =
  | {
      status: CustomerStatus
      customerEmails: {
        email: string
      }[]
    }
  | {
      message: string
      code: string
      issues: [
        {
          message: string
        },
      ]
    }

export type CheckKycRes = {
  type: 'Company' | 'Individual'
  status: CustomerStatus
}

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams

  const userAddress = queryParams.get('userAddress')

  if (!userAddress) {
    return Response.json({ message: 'Missing Parameters' }, { status: 400 })
  }

  const projectId = process.env.NEXERA_PROJECT_ID || NEXERA_PROJECT_ID

  try {
    const apiKey = getRequiredEnv('NEXERA_API_KEY')

    const kybRes = await fetch(
      `${NEXERA_API_BASE_URL}/companies/details?address=${userAddress.toLowerCase()}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )

    const data: KybRes = await kybRes.json()

    if ('status' in data && Boolean(data.status)) {
      return Response.json({ type: 'Company', status: data.status })
    }

    try {
      const kycRes = await fetch(
        `${NEXERA_API_BASE_URL}/projects/${projectId}/customer-wallets/${userAddress.toLowerCase()}/customer`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )

      const data: KycRes = await kycRes.json()

      if (!('status' in data)) {
        if (data.message !== 'Customer not found.') {
          return Response.json(data.message, { status: 404 })
        }

        return Response.json(data.message, { status: 400 })
      }

      if (data.status === 'Active' && !data.customerEmails[0]?.email) {
        return Response.json({ type: 'Individual', status: 'No Email' })
      }

      return Response.json({ type: 'Individual', status: data.status })
    } catch (error) {
      return Response.json({ error }, { status: 500 })
    }
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
