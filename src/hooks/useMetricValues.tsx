import { useMemo } from 'react'

import { PoolMetric } from '@/types/lending'

interface MetricValue {
  id: string
  content: string | null
  unit?: string
}

interface MetricValues {
  [key: string]: MetricValue
}

/**
 * Hook to select and format metrics by IDs for UI display.
 *
 * @param metrics - Array of all pool metrics.
 * @param metricIds - IDs of metrics to retrieve.
 * @returns An object with specified metrics, including their value and unit.
 */
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
