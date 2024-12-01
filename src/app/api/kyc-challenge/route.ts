import { createSdk } from '@compilot/js-sdk'
import { NextRequest, NextResponse } from 'next/server'

const apiClient = createSdk({
  apiKey: 'd63fe62e-0e67-4c6c-8afc-b31ff3b7bc23',
})

const KYC_WORKFLOW = 'c8493d6c-48e5-4884-b87e-c3eaf371d314'
const KYB_WORKFLOW = 'e73e3fc4-1396-4267-87e9-6f828f87c2aa'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { isIndividual, ...args } = body

    const sessionRes = await apiClient.createWeb3Challenge({
      workflowId: isIndividual ? KYC_WORKFLOW : KYB_WORKFLOW,
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
