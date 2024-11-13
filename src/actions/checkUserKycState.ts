'use server'

import { getCustomerStatus } from '@compilot/react-sdk'

import NEXERA_API_BASE_URL, {
  NEXERA_PROJECT_ID,
} from '@/config/nexera/api.nexera'

export type CustomerStatus =
  | Awaited<ReturnType<typeof getCustomerStatus>>
  | 'No Email'

type ApiRes =
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
): Promise<CustomerStatus | undefined> => {
  const projectId = process.env.NEXERA_PROJECT_ID || NEXERA_PROJECT_ID

  try {
    const response = await fetch(
      `${NEXERA_API_BASE_URL}/projects/${projectId}/customer-wallets/${userAddress.toLowerCase()}/customer`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
        },
      }
    )

    const data: ApiRes = await response.json()

    if (!('status' in data)) {
      if (data.message !== 'Customer not found.') {
        throw new Error(data.message, { cause: data })
      }

      return undefined
    }

    if (!data.customerEmails[0]?.email) {
      return 'No Email'
    }

    return data.status
  } catch (error) {
    console.error(error)
  }
}

export default checkUserKycState
