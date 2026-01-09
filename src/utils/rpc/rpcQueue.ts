type WrapOptions = {
  maxConcurrent?: number
  sponsorTransactions?: boolean
}

const readOnlyMethods = new Set([
  'eth_call',
  'eth_getBalance',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getCode',
  'eth_getLogs',
  'eth_getStorageAt',
  'eth_blockNumber',
  'eth_chainId',
])

// Queue read-only RPC calls to keep wallet providers under rate limits.
export const wrapQueuedProvider = <T extends object>(
  provider: T | undefined | null,
  options?: WrapOptions
) => {
  if (!provider) return provider

  const withSponsorParam = (params: unknown) => {
    if (!options?.sponsorTransactions) return params

    const addSponsor = (tx: unknown) => {
      if (!tx || typeof tx !== 'object') return tx
      if ('sponsor' in (tx as Record<string, unknown>)) return tx
      return { ...(tx as Record<string, unknown>), sponsor: true }
    }

    if (Array.isArray(params)) {
      if (!params.length) return params
      const [tx, ...rest] = params
      return [addSponsor(tx), ...rest]
    }

    if (params && typeof params === 'object' && 'transaction' in params) {
      const paramRecord = params as Record<string, unknown>
      return {
        ...paramRecord,
        transaction: addSponsor(paramRecord.transaction),
      }
    }

    return params
  }

  const maxConcurrent = Math.max(1, options?.maxConcurrent ?? 2)
  let inFlight = 0
  const queue: Array<() => void> = []

  const enqueue = <R>(task: () => Promise<R>) => {
    return new Promise<R>((resolve, reject) => {
      const run = () => {
        inFlight += 1
        task()
          .then(resolve, reject)
          .finally(() => {
            inFlight -= 1
            flush()
          })
      }

      queue.push(run)
      flush()
    })
  }

  const flush = () => {
    while (inFlight < maxConcurrent && queue.length) {
      const next = queue.shift()
      if (!next) break
      next()
    }
  }

  return new Proxy(provider, {
    get(target, prop) {
      if (prop === 'request') {
        return async (args: { method?: string; params?: unknown }) => {
          const method = args?.method || ''
          const nextArgs =
            method === 'eth_sendTransaction'
              ? { ...args, params: withSponsorParam(args?.params) }
              : args
          const runner = async () => {
            return await (target as any).request?.(nextArgs)
          }

          return readOnlyMethods.has(method) ? enqueue(runner) : runner()
        }
      }

      if (prop === 'send') {
        return async (method: string, params: unknown[] = []) => {
          const nextParams =
            method === 'eth_sendTransaction'
              ? (withSponsorParam(params) as unknown[])
              : params
          const runner = async () => {
            return await (target as any).send?.(method, nextParams)
          }

          return readOnlyMethods.has(method) ? enqueue(runner) : runner()
        }
      }

      const value = Reflect.get(target as object, prop)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}
