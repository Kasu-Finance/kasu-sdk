import { Box, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'
import { WithdrawMetrics } from '@/context/withdrawModal/withdrawModal.types'

import { formatAccount } from '@/utils'

interface WithdrawModalMetricsProps {
  poolData: PoolOverview
  poolBalance: string
  trancheBalance: string
  modalStatusAction: number
  selectedTranche: string
  isMultiTranche: boolean
  metricsRowClassName?: string
}

const WithdrawModalMetrics: React.FC<WithdrawModalMetricsProps> = ({
  poolData,
  poolBalance,
  trancheBalance,
  modalStatusAction,
  selectedTranche,
  isMultiTranche,
  metricsRowClassName,
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const userAddress = useMemo(() => formatAccount(account), [account])

  const totalInvestment = {
    id: WithdrawMetrics.TOTAL_INVESTMENT,
    content: poolBalance,
    unit: 'USDC',
  }

  const trancheInvestment = {
    id: WithdrawMetrics.TRANCHE_INVESTMENT,
    content: trancheBalance,
    unit: 'USDC',
  }

  const findTranche = poolData.tranches.find((_) => _.id === selectedTranche)
  const tranche = {
    id: WithdrawMetrics.TRANCHE,
    content: findTranche?.name || '',
  }
  const toWallet = { id: WithdrawMetrics.TO_WALLET, content: userAddress || '' }

  const showTrancheInvestment =
    modalStatusAction === ModalStatusAction.REQUEST &&
    isMultiTranche &&
    trancheInvestment

  return (
    <>
      <Box display='flex' className={metricsRowClassName} mt={3}>
        <Box width='50%' pr={1}>
          <InfoColumn
            showDivider
            title={t('lending.withdraw.fromPool')}
            metric={
              <Typography variant='h6' pl={2} mt={0.5}>
                {poolData.poolName || ''}
              </Typography>
            }
          />
        </Box>

        {totalInvestment && (
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

      {showTrancheInvestment && (
        <Box display='flex' className={metricsRowClassName} pt={2}>
          <Box flex={1} /> {/* Empty space for alignment */}
          <MetricWithSuffix
            key={trancheInvestment.id}
            titleKey={t('lending.withdraw.metrics.trancheInvestment.label')}
            tooltipKey={t('lending.withdraw.metrics.trancheInvestment.tooltip')}
            content={String(trancheInvestment.content)}
            suffix={trancheInvestment.unit}
            containerSx={{ width: '50%', pb: 1 }}
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}

      {modalStatusAction === ModalStatusAction.APPROVE && (
        <Box display='flex' className={metricsRowClassName} pt={2}>
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
            <Box flex={1} /> // Empty space for alignment
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
      )}
    </>
  )
}

export default WithdrawModalMetrics
