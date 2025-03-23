import { createSdk } from '@compilot/js-sdk'
import { NextRequest, NextResponse } from 'next/server'

const apiClient = createSdk({
  apiKey: process.env.NEXERA_API_KEY || '',
})

const KYC_WORKFLOW = process.env.KYC_WORKFLOW || ''
const KYB_WORKFLOW = process.env.KYB_WORKFLOW || ''

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
