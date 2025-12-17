import { NextRequest } from 'next/server'

import NEXERA_API_BASE_URL, {
  NEXERA_PROJECT_ID,
} from '@/config/nexera/api.nexera'
import { getRequiredEnv } from '@/utils/env'

import type { CustomerStatus } from '@/types/kyc'

const normalizeStatus = (
  status: CustomerStatus | null | undefined
): CustomerStatus => (status ?? 'No status') as CustomerStatus

const canRetryStatus = (status: CustomerStatus) =>
  status === 'Rejected' ||
  status === 'Failed' ||
  status === 'Terminated' ||
  status === 'Dormant' ||
  status === 'No status'

type KybRes =
  | {
      status: CustomerStatus | null
      companyClaims: {
        email: string
      }[]
      reason?: string | null
    }
  | {
      message: string
      code: string
      traceId: string
    }

type KycRes =
  | {
      status: CustomerStatus | null
      customerEmails: {
        email: string
      }[]
      reason?: string | null
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
      const status = normalizeStatus(data.status)
      return Response.json({
        type: 'Company',
        status,
        canRetry: canRetryStatus(status),
        reason: 'reason' in data ? data.reason : null,
      })
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
        if (data.message === 'Customer not found.') {
          const status = normalizeStatus('No status')
          return Response.json({
            type: 'Individual',
            status,
            canRetry: canRetryStatus(status),
            reason: null,
          })
        }

        return Response.json(
          {
            message: data.message,
            issues: data.issues,
            code: data.code,
          },
          { status: 502 }
        )
      }

      if (
        normalizeStatus(data.status) === 'Active' &&
        !data.customerEmails[0]?.email
      ) {
        return Response.json({
          type: 'Individual',
          status: 'No Email',
          canRetry: false,
          reason: data.reason ?? null,
        })
      }

      const status = normalizeStatus(data.status)
      return Response.json({
        type: 'Individual',
        status,
        canRetry: canRetryStatus(status),
        reason: data.reason ?? null,
      })
    } catch (error) {
      return Response.json({ error }, { status: 500 })
    }
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
