import { createSdk } from '@compilot/js-sdk'
import { NextRequest, NextResponse } from 'next/server'

import { getRequiredEnv } from '@/utils/env'

const getApiClient = () => {
  const apiKey = getRequiredEnv('NEXERA_API_KEY')

  return createSdk({ apiKey })
}

const getWorkflowId = (envKey: 'KYC_WORKFLOW' | 'KYB_WORKFLOW') =>
  getRequiredEnv(envKey)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { isIndividual, ...args } = body

    const sessionRes = await getApiClient().createWeb3Challenge({
      workflowId: isIndividual
        ? getWorkflowId('KYC_WORKFLOW')
        : getWorkflowId('KYB_WORKFLOW'),
      ...args,
    })

    return NextResponse.json(sessionRes, { status: 200 })
  } catch (error) {
    console.error('API call error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access token' },
      { status: 500 }
    )
  }
}
