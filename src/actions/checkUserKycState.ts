'use server'

import NEXERA_API_BASE_URL, { NEXERA_PROJECT_ID } from '@/config/api.nexera'

type NexeraCustomerStatus =
  | 'Active'
  | 'Rejected'
  | 'Dormant'
  | 'To be reviewed'
  | 'Failed'
  | 'Escalated'
  | 'Terminated'

type ApiRes =
  | {
      status: NexeraCustomerStatus
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
): Promise<NexeraCustomerStatus | undefined> => {
  const projectId = process.env.NEXERA_PROJECT_ID || NEXERA_PROJECT_ID

  try {
    const response = await fetch(
      `${NEXERA_API_BASE_URL}/customers/project/${projectId}/wallet-address/${userAddress.toLowerCase()}`,
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

    return data.status
  } catch (error) {
    console.error(error)
  }
}

export default checkUserKycState
