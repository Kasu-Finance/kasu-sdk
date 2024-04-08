import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

interface Metric {
  id: string
  content: string
  unit: string
}

interface MetricsSection {
  title: string
  metrics: Metric[]
}

interface RenderMetricsProps {
  metricsSection: MetricsSection
  sectionKey: string
}

const RenderMetrics: React.FC<RenderMetricsProps> = ({
  metricsSection,
  sectionKey,
}) => {
  const { t } = useTranslation()

  const rowsKeys = ['closingLoans', 'netInflows', 'netDeposit', 'netDeposits']

  return metricsSection.metrics?.map((metric, index) => {
    const baseKey = `${metricsSection.title}-${metric.id}-${index}`
    const labelKey = `repayments.sections.${sectionKey}.metrics.${metric.id}.label`
    const tooltipKey = `repayments.sections.${sectionKey}.metrics.${metric.id}.tooltip`
    const asRow = !rowsKeys.includes(metric.id)

    return asRow ? (
      <InfoRow
        key={baseKey}
        title={t(labelKey)}
        toolTipInfo={t(tooltipKey)}
        showDivider
        metric={
          <ContentWithSuffix content={metric.content} suffix={metric.unit} />
        }
        sx={{ mb: 2, flexDirection: 'row' }}
      />
    ) : (
      <ColoredBox>
        <MetricWithSuffix
          key={baseKey}
          titleKey={t(labelKey)}
          tooltipKey={t(tooltipKey)}
          content={metric.content}
          suffix={metric.unit}
          containerSx={{ mb: 2 }}
        />
      </ColoredBox>
    )
  })
}

export default RenderMetrics
