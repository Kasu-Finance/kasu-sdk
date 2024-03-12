export interface PoolMetric {
  id: string
  content: string | number | string[]
  unit?: string
  isRating?: boolean
}

export interface PoolDetailSection {
  id: string
  metrics: PoolMetric[]
}

export interface RiskManagementSection {
  riskStatus: PoolDetailSection
  security: PoolDetailSection
  criteria: PoolDetailSection
}
