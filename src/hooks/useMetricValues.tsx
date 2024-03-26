import { PoolMetric } from 'kasu-sdk/src/types'
import { useMemo } from 'react'

interface MetricValue {
  id: string
  content: string | null
  unit?: string
}

interface MetricValues {
  [key: string]: MetricValue
}

const useMetricValues = (
  metrics: PoolMetric[],
  metricIds: string[]
): MetricValues => {
  return useMemo(() => {
    const values: MetricValues = {}
    metricIds.forEach((id) => {
      const foundMetric = metrics.find((metric) => metric.id === id)
      values[id] = {
        id,
        content: foundMetric ? String(foundMetric.content) : null,
        unit: foundMetric?.unit ?? undefined,
      }
    })
    return values
  }, [metrics, metricIds])
}

export default useMetricValues
