import { PoolOverview } from '@kasufinance/kasu-sdk'

export type HighestYieldTrancheWithCapacity = {
  pool: PoolOverview
  tranche: PoolOverview['tranches'][number]
  apy: number
}

const getHighestYieldTrancheWithCapacity = (
  pools?: PoolOverview[] | null
): HighestYieldTrancheWithCapacity | null => {
  if (!pools?.length) return null

  let best: HighestYieldTrancheWithCapacity | null = null

  for (const pool of pools) {
    for (const tranche of pool.tranches ?? []) {
      const capacity = Number(tranche.poolCapacity)
      if (!Number.isFinite(capacity) || capacity <= 0) continue

      const apy =
        typeof tranche.apy === 'string' ? parseFloat(tranche.apy) : tranche.apy
      if (!Number.isFinite(apy)) continue

      if (!best) {
        best = { pool, tranche, apy }
        continue
      }

      const bestCapacity = Number(best.tranche.poolCapacity)
      const shouldReplace =
        apy > best.apy || (apy === best.apy && capacity > bestCapacity)

      if (shouldReplace) {
        best = { pool, tranche, apy }
      }
    }
  }

  return best
}

export default getHighestYieldTrancheWithCapacity
