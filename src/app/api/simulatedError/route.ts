import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
