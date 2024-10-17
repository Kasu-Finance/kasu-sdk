import { createSdk } from '@compilot/js-sdk'
import { NextRequest, NextResponse } from 'next/server'

const apiClient = createSdk({
  apiKey: 'd63fe62e-0e67-4c6c-8afc-b31ff3b7bc23',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const sessionRes = await apiClient.createWeb3Challenge({
      workflowId: 'c8493d6c-48e5-4884-b87e-c3eaf371d314',
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
