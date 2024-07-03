import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = request.nextUrl
  const baseUrl = `${url.protocol}//${url.host}`

  // Clone the response to modify headers
  const response = NextResponse.next()
  response.headers.set('x-base-url', baseUrl)

  return response
}
