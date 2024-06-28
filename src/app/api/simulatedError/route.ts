import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
