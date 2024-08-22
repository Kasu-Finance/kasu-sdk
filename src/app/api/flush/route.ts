import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

const flushTags = (cachedTags: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      for (const tag of cachedTags) {
        revalidateTag(tag)
      }
      resolve()
    } catch (error) {
      reject(new Error(`Failed to revalidate cache: ${error}`))
    }
  })
}

export async function GET(_req: Request): Promise<Response> {
  const cachedTags: string[] = [
    'pools',
    'totals',
    'poolDelegate',
    'unusedPools',
    'filteredUnusedPools',
    'currentEpoch',
  ]

  console.warn('flushing cache:', cachedTags)

  try {
    await flushTags(cachedTags)
    return new Response(`API cache flushed: ${cachedTags.join(',')}`, {
      status: 200,
    })
  } catch (error) {
    console.error('Error flushing cache:', error)
    return new Response('Failed to flush API cache', { status: 500 })
  }
}
