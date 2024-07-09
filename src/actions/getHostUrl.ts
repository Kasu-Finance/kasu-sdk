'use server'
import { headers } from 'next/headers'

export async function getHostUrl() {
  const headersList = headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host')

  // TODO: host function does not return always the correct host
  return process.env.NEXT_DAPP_BASE_URL || `${protocol}://${host}`
}
