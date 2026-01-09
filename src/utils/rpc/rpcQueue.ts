type WrapOptions = {
  maxConcurrent?: number
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
        return async (args: { method?: string; params?: unknown[] }) => {
          const runner = async () => {
            return await (target as any).request?.(args)
          }

          return readOnlyMethods.has(args?.method || '')
            ? enqueue(runner)
            : runner()
        }
      }

      if (prop === 'send') {
        return async (method: string, params: unknown[] = []) => {
          const runner = async () => {
            return await (target as any).send?.(method, params)
          }

          return readOnlyMethods.has(method) ? enqueue(runner) : runner()
        }
      }

      const value = Reflect.get(target as object, prop)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}
