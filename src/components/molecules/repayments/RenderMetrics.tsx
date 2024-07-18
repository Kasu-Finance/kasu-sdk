import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'

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
            dynamicLabel !== 'N/A' && (
              <InfoRow
                key={baseKey}
                title={dynamicLabel || t(labelKey)}
                toolTipInfo={dynamicLabel ? '' : t(tooltipKey)}
                titleStyle={{
                  variant: isMobile ? 'body1' : 'h6',
                  fontSize: { xs: 10, sm: 14 },
                }}
                sx={(theme) => ({
                  flexDirection: 'row',
                  [theme.breakpoints.down('sm')]: {
                    py: 1,
                    px: 0,
                  },
                })}
                showDivider
                metric={
                  <ContentWithSuffix
                    content={String(metric.content)}
                    suffix={metric.unit}
                    variant={isMobile ? 'body2' : 'h6'}
                    suffixVariant={isMobile ? 'caption' : 'body1'}
                  />
                }
              />
            )
          )
        } else {
          return (
            <ColoredBox key={baseKey} p={{ xs: 1, sm: 0 }}>
              <InfoColumn
                title={t(labelKey)}
                toolTipInfo={t(tooltipKey)}
                showDivider
                titleContainerSx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    px: 0,
                  },
                })}
                titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                metric={
                  <TokenAmount
                    amount={metric.content.toString()}
                    symbol={metric.unit}
                    px={{ xs: 0, sm: 2 }}
                    py='6px'
                  />
                }
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
