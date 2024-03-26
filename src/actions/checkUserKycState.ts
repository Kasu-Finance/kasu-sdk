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
      message: 'string'
      code: 'string'
      issues: [
        {
          message: 'string'
        },
      ]
    }

const checkUserKycState = async (
  userAddress: string
): Promise<NexeraCustomerStatus> => {
  const response = await fetch(
    `${NEXERA_API_BASE_URL}/customers/project/${NEXERA_PROJECT_ID}/wallet-address/${userAddress.toLowerCase()}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXERA_API_KEY}`,
      },
    }
  )

  const data: ApiRes = await response.json()

  if (!('status' in data)) throw new Error(data.message, { cause: data })

  return data.status
}

export default checkUserKycState
