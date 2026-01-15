import type { UnsignedTransactionRequest } from '@privy-io/react-auth'

type SendTransactionFn = (
  input: UnsignedTransactionRequest,
  options?: { sponsor?: boolean; address?: string }
) => Promise<{ hash: string }>

type WrapOptions = {
  maxConcurrent?: number
  sponsorTransactions?: boolean
  sendTransaction?: SendTransactionFn
  sendTransactionAddress?: string
}

const getTransactionParam = (params: unknown) => {
  if (Array.isArray(params)) {
    if (!params.length) return null
    return params[0]
  }

  if (params && typeof params === 'object' && 'transaction' in params) {
    return (params as Record<string, unknown>).transaction ?? null
  }

  if (params && typeof params === 'object') {
    return params
  }

  return null
}

const parseChainId = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') {
    if (value.startsWith('0x')) {
      return Number.parseInt(value, 16)
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const buildUnsignedTransaction = (
  tx: Record<string, unknown>
): UnsignedTransactionRequest => {
  const chainId = parseChainId(tx.chainId ?? tx.chain_id)
  const accessList = (tx.accessList ?? tx.access_list) as
    | UnsignedTransactionRequest['accessList']
    | undefined

  const unsignedTx: UnsignedTransactionRequest = {
    from: tx.from as string | undefined,
    to: tx.to as string | undefined,
    data: tx.data as UnsignedTransactionRequest['data'],
    value: tx.value as UnsignedTransactionRequest['value'],
    nonce: tx.nonce as UnsignedTransactionRequest['nonce'],
    gasLimit: (tx.gasLimit ?? tx.gas) as UnsignedTransactionRequest['gasLimit'],
    gasPrice: (tx.gasPrice ??
      tx.gas_price) as UnsignedTransactionRequest['gasPrice'],
    maxFeePerGas: (tx.maxFeePerGas ??
      tx.max_fee_per_gas) as UnsignedTransactionRequest['maxFeePerGas'],
    maxPriorityFeePerGas: (tx.maxPriorityFeePerGas ??
      tx.max_priority_fee_per_gas) as UnsignedTransactionRequest['maxPriorityFeePerGas'],
    type: tx.type as UnsignedTransactionRequest['type'],
    accessList,
  }

  if (chainId !== undefined) {
    unsignedTx.chainId = chainId
  }

  return unsignedTx
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

  const sendWithPrivy = async (params: unknown) => {
    if (!options?.sendTransaction) return null

    const txParam = getTransactionParam(params)
    if (!txParam || typeof txParam !== 'object') {
      throw new Error('wrapQueuedProvider: invalid transaction params')
    }

    const unsignedTx = buildUnsignedTransaction(
      txParam as Record<string, unknown>
    )

    const address =
      (typeof unsignedTx.from === 'string' && unsignedTx.from) ||
      options.sendTransactionAddress

    const sendOptions = {
      sponsor: options.sponsorTransactions,
      ...(address ? { address } : {}),
    }

    const result = await options.sendTransaction(unsignedTx, sendOptions)
    return result.hash
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
          if (method === 'eth_sendTransaction') {
            const hash = await sendWithPrivy(args?.params)
            if (hash) return hash
          }
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
          if (method === 'eth_sendTransaction') {
            const hash = await sendWithPrivy(params)
            if (hash) return hash
          }
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
