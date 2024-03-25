import { Box, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { PoolMetric } from 'kasu-sdk/src/types'
import React, { memo, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { WithdrawMetrics, WithdrawSteps } from '@/constants'
import { formatAccount } from '@/utils'

interface MetricsSectionProps {
  poolName: string
  metrics: PoolMetric[]
  activeStep: number
  selectedTranche: string
  isMultiTranche: boolean
  metricsRowClassName?: string
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  poolName,
  metrics,
  activeStep,
  selectedTranche,
  isMultiTranche,
  metricsRowClassName,
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const userAddress = useMemo(() => formatAccount(account), [account])

  const totalInvestment = useMemo(
    () =>
      metrics.find((metric) => metric.id === WithdrawMetrics.TOTAL_INVESTMENT),
    [metrics]
  )

  const trancheInvestment = useMemo(
    () =>
      metrics.find(
        (metric) => metric.id === WithdrawMetrics.TRANCHE_INVESTMENT
      ),
    [metrics]
  )

  const tranche = {
    id: WithdrawMetrics.TRANCHE,
    content: selectedTranche || '',
  }

  const toWallet = { id: WithdrawMetrics.TO_WALLET, content: userAddress || '' }

  const showTrancheInvestment =
    activeStep === WithdrawSteps.REQUEST && isMultiTranche && trancheInvestment

  return (
    <>
      <Box display='flex' className={metricsRowClassName} mt={3}>
        <Box width='50%' pr={1}>
          <InfoColumn
            showDivider
            title={t('lending.withdraw.fromPool')}
            metric={
              <Typography variant='h6' pl={2} mt={0.5}>
                {poolName}
              </Typography>
            }
          />
        </Box>

        {totalInvestment && (
          <MetricWithSuffix
            key={totalInvestment.id}
            titleKey={t(`lending.withdraw.metrics.${totalInvestment.id}.label`)}
            tooltipKey={t(
              `lending.withdraw.metrics.${totalInvestment.id}.tooltip`
            )}
            suffix={totalInvestment.unit}
            content={String(totalInvestment.content)}
            containerSx={{ width: '50%' }}
            sx={{ mt: 0.5 }}
          />
        )}
      </Box>

      {showTrancheInvestment && (
        <Box display='flex' className={metricsRowClassName} pt={2}>
          <Box flex={1} /> {/* Empty space for alignment */}
          <MetricWithSuffix
            key={trancheInvestment.id}
            titleKey={t(
              `lending.withdraw.metrics.${trancheInvestment.id}.label`
            )}
            tooltipKey={t(
              `lending.withdraw.metrics.${trancheInvestment.id}.tooltip`
            )}
            content={String(trancheInvestment.content)}
            suffix={trancheInvestment.unit}
            containerSx={{ width: '50%', pb: 1 }}
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}

      {activeStep === WithdrawSteps.APPROVE && (
        <Box display='flex' className={metricsRowClassName} pt={2}>
          {isMultiTranche ? (
            <MetricWithSuffix
              key={tranche.id}
              titleKey={t(`lending.withdraw.metrics.${tranche.id}.label`)}
              tooltipKey={t(`lending.withdraw.metrics.${tranche.id}.tooltip`)}
              content={String(tranche.content)}
              containerSx={{ width: '50%', pb: 1 }}
              sx={{ mt: 0.5 }}
            />
          ) : (
            <Box flex={1} /> // Empty space for alignment
          )}

          <MetricWithSuffix
            key={toWallet.id}
            titleKey={t(`lending.withdraw.${toWallet.id}`)}
            tooltipKey=''
            content={toWallet.content}
            containerSx={{ width: '50%', pb: 1 }}
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}
    </>
  )
}

export default memo(MetricsSection)
