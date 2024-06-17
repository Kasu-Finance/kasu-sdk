export interface PoolMetric {
  id: string
  content: string | number | string[] | { name: string; id: string }[]
  unit?: string
  isRating?: boolean
}

export interface PoolDetailSection {
  id: string
  metrics: PoolMetric[]
}

export type HexString = `0x${string}`
