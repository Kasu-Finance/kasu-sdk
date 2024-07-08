'use server'
import { headers } from 'next/headers'

export async function getHostUrl() {
  const headersList = headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host')

  return `${protocol}://${host}`
}
