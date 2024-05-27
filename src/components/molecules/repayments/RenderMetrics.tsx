import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { RepaymentsMetrics } from '@/constants/repayments'
import { RepaymentSection } from '@/utils/convert/adaptDataForRepayments'

interface RenderMetricsProps {
  data: RepaymentSection
  sectionKey: string
}

const RenderMetrics: React.FC<RenderMetricsProps> = ({ data, sectionKey }) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const rowKeysSet = useMemo(
    () =>
      new Set([
        RepaymentsMetrics.CLOSING_LOANS,
        RepaymentsMetrics.NET_INFLOWS,
        RepaymentsMetrics.NET_DEPOSIT,
        RepaymentsMetrics.NET_DEPOSITS,
      ]),
    []
  )

  const metrics = useMemo(
    () =>
      data.metrics.map((metric, index) => {
        const dynamicLabel = metric.label
        const baseKey = `${metric.id}-${index}`
        const labelKey = `repayments.sections.${sectionKey}.metrics.${metric.id}.label`
        const tooltipKey = `repayments.sections.${sectionKey}.metrics.${metric.id}.tooltip`
        const renderAsRow = !rowKeysSet.has(metric.id as RepaymentsMetrics)

        if (renderAsRow) {
          return (
            <InfoRow
              key={baseKey}
              title={dynamicLabel || t(labelKey)}
              toolTipInfo={dynamicLabel ? '' : t(tooltipKey)}
              titleStyle={{ variant: isMobile ? 'body1' : 'h6' }}
              showDivider
              metric={
                <ContentWithSuffix
                  content={String(metric.content)}
                  suffix={metric.unit}
                  variant={isMobile ? 'body2' : 'h6'}
                  suffixVariant={isMobile ? 'caption' : 'body1'}
                />
              }
              sx={{ flexDirection: 'row' }}
            />
          )
        } else {
          return (
            <ColoredBox key={baseKey}>
              <MetricWithSuffix
                titleKey={t(labelKey)}
                tooltipKey={t(tooltipKey)}
                content={String(metric.content)}
                suffix={metric.unit}
                containerSx={{ mb: 1 }}
                variant={isMobile ? 'body2' : 'h6'}
              />
            </ColoredBox>
          )
        }
      }),
    [data.metrics, rowKeysSet, t, sectionKey, isMobile]
  )

  return <>{metrics}</>
}

export default RenderMetrics
