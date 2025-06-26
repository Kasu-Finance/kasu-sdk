import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const now = new Date().getTime()

  console.error(`Loggin API at : ${now}`)
  console.error(body)
  console.error('End Logging')

  return Response.json({})
}
