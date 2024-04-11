import { Box, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { FC } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { PoolMetric } from '@/types/lending'

interface BalanceInfoProps {
  modalStatusAction: number
  poolData: PoolOverview
  totalInvestment: PoolMetric
  withdrawRequest: { id: string; content: string; unit: string }
  className?: string
}

const BalanceInfo: FC<BalanceInfoProps> = ({
  modalStatusAction,
  poolData,
  totalInvestment,
  withdrawRequest,
  className,
}) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' className={className} mt={3}>
      <Box width='50%' pr={2}>
        <InfoColumn
          showDivider
          title={t('lending.withdraw.fromPool')}
          metric={
            <Typography variant='h6' pl={2} mt={0.5}>
              {poolData.poolName || 'N/A'}
            </Typography>
          }
        />
      </Box>

      {modalStatusAction === ModalStatusAction.APPROVE ? (
        <MetricWithSuffix
          key={withdrawRequest.id}
          titleKey={t('lending.withdraw.amountInput.label')}
          tooltipKey={t('lending.withdraw.amountInput.tooltip')}
          content={withdrawRequest.content}
          suffix={withdrawRequest.unit}
          containerSx={{ width: '50%', pb: 1 }}
          sx={{ mt: 0.5 }}
        />
      ) : (
        <MetricWithSuffix
          key={totalInvestment.id}
          titleKey={t('lending.withdraw.metrics.totalInvestment.label')}
          tooltipKey={t('lending.withdraw.metrics.totalInvestment.tooltip')}
          suffix={totalInvestment.unit}
          content={String(totalInvestment.content)}
          containerSx={{ width: '50%' }}
          sx={{ mt: 0.5 }}
        />
      )}
    </Box>
  )
}

export default BalanceInfo
