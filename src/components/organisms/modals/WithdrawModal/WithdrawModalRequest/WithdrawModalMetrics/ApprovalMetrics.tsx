import { Box } from '@mui/material'
import React from 'react'

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
  return (
    <Box display='flex' className={className}>
      {isMultiTranche ? (
        <MetricWithSuffix
          key={tranche.id}
          titleKey='lending.withdraw.metrics.tranche.label'
          tooltipKey='lending.withdraw.metrics.tranche.tooltip'
          content={String(tranche.content)}
          containerSx={{ width: '50%', pb: 1, pr: 2 }}
          sx={{ mt: 0.5 }}
        />
      ) : (
        <Box flex={1} /> // This creates a space if there is no tranche to show
      )}
      <MetricWithSuffix
        key={toWallet.id}
        titleKey='lending.withdraw.toWallet'
        tooltipKey=''
        content={toWallet.content}
        containerSx={{ width: '50%', pb: 1 }}
        sx={{ mt: 0.5 }}
      />
    </Box>
  )
}

export default ApprovalMetrics
