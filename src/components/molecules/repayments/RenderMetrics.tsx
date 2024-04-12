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

  const rowsKeys = [
    RepaymentsMetrics.ClosingLoans,
    RepaymentsMetrics.NetInflows,
    RepaymentsMetrics.NetDeposit,
    RepaymentsMetrics.NetDeposits,
  ]

  return data.metrics?.map((metric, index) => {
    const baseKey = `${metric.id}-${index}`
    const labelKey = `repayments.sections.${sectionKey}.metrics.${metric.id}.label`
    const tooltipKey = `repayments.sections.${sectionKey}.metrics.${metric.id}.tooltip`
    const renderAsRow = !rowsKeys.includes(metric.id as RepaymentsMetrics)

    return renderAsRow ? (
      <InfoRow
        key={baseKey}
        title={t(labelKey)}
        toolTipInfo={t(tooltipKey)}
        showDivider
        metric={
          <ContentWithSuffix
            content={String(metric.content)}
            suffix={metric.unit}
          />
        }
        sx={{ flexDirection: 'row' }}
      />
    ) : (
      <ColoredBox>
        <MetricWithSuffix
          key={baseKey}
          titleKey={t(labelKey)}
          tooltipKey={t(tooltipKey)}
          content={String(metric.content)}
          suffix={metric.unit}
          containerSx={{ mb: 1 }}
        />
      </ColoredBox>
    )
  })
}

export default RenderMetrics
