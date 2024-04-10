import { Box } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

interface ApprovalMetricsProps {
  tranche: { id: string; content: string }
  toWallet: { id: string; content: string }
  isMultiTranche: boolean
  className?: string
}

const ApprovalMetrics: React.FC<ApprovalMetricsProps> = ({
  tranche,
  toWallet,
  isMultiTranche,
  className,
}) => {
  const { t } = useTranslation()
  return (
    <Box display='flex' className={className} pt={2}>
      {isMultiTranche ? (
        <MetricWithSuffix
          key={tranche.id}
          titleKey={t('lending.withdraw.metrics.tranche.label')}
          tooltipKey={t('lending.withdraw.metrics.tranche.tooltip')}
          content={String(tranche.content)}
          containerSx={{ width: '50%', pb: 1 }}
          sx={{ mt: 0.5 }}
        />
      ) : (
        <Box flex={1} /> // This creates a space if there is no tranche to show
      )}
      <MetricWithSuffix
        key={toWallet.id}
        titleKey={t('lending.withdraw.toWallet')}
        tooltipKey=''
        content={toWallet.content}
        containerSx={{ width: '50%', pb: 1 }}
        sx={{ mt: 0.5 }}
      />
    </Box>
  )
}

export default ApprovalMetrics
