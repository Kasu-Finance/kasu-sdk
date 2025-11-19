import { createSdk } from '@compilot/js-sdk'
import { NextRequest, NextResponse } from 'next/server'

import { getRequiredEnv } from '@/utils/env'

const EMAIL_WORKFLOW = 'a95f52b0-7017-4745-ab92-4106b8e89e33'

const getApiClient = () => {
  const apiKey = getRequiredEnv('NEXERA_API_KEY')

  return createSdk({ apiKey })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const sessionRes = await getApiClient().createWeb3Challenge({
      workflowId: EMAIL_WORKFLOW,
      ...body,
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
