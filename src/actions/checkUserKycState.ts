'use server'

import { getCustomerStatus } from '@compilot/react-sdk'

import NEXERA_API_BASE_URL, {
  NEXERA_PROJECT_ID,
} from '@/config/nexera/api.nexera'

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

const checkUserKycState = async (
  userAddress: string
): Promise<
  { type: 'Company' | 'Individual'; status: CustomerStatus } | undefined
> => {
  const projectId = process.env.NEXERA_PROJECT_ID || NEXERA_PROJECT_ID

  try {
    const kybRes = await fetch(
      `${NEXERA_API_BASE_URL}/companies/details?address=${userAddress.toLowerCase()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
        },
      }
    )

    const data: KybRes = await kybRes.json()

    if ('status' in data) {
      return { type: 'Company', status: data.status }
    }

    try {
      const kycRes = await fetch(
        `${NEXERA_API_BASE_URL}/projects/${projectId}/customer-wallets/${userAddress.toLowerCase()}/customer`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
          },
        }
      )

      const data: KycRes = await kycRes.json()

      if (!('status' in data)) {
        if (data.message !== 'Customer not found.') {
          throw new Error(data.message, { cause: data })
        }

        return undefined
      }

      if (data.status === 'Active' && !data.customerEmails[0]?.email) {
        return { type: 'Individual', status: 'No Email' }
      }

      return { type: 'Individual', status: data.status }
    } catch (error) {
      console.error(error)
    }
  } catch (error) {
    console.error(error)
  }
}

export default checkUserKycState
