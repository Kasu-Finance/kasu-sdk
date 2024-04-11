import { Box } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import ApprovalMetrics from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawModalMetrics/ApprovalMetrics'
import BalanceInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawModalMetrics/BalanceInfo'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'
import { WithdrawMetrics } from '@/context/withdrawModal/withdrawModal.types'

import { formatAccount } from '@/utils'

interface WithdrawModalMetricsProps {
  amount: string
  poolData: PoolOverview
  poolBalance: string
  trancheBalance: string
  modalStatusAction: number
  selectedTranche: string
  isMultiTranche: boolean
  metricsRowClassName?: string
}

const WithdrawModalMetrics: React.FC<WithdrawModalMetricsProps> = ({
  amount,
  poolData,
  poolBalance,
  trancheBalance,
  modalStatusAction,
  selectedTranche,
  isMultiTranche,
  metricsRowClassName,
}) => {
  const { account } = useWeb3React()
  const userAddress = useMemo(() => formatAccount(account), [account])
  const { t } = useTranslation()

  const getUserTranche = poolData?.tranches?.find(
    (tranche) => tranche.id === selectedTranche
  )

  const tranche = {
    id: WithdrawMetrics.TRANCHE,
    content: getUserTranche?.name || '',
  }

  const totalInvestment = {
    id: WithdrawMetrics.TOTAL_INVESTMENT,
    content: parseFloat(poolBalance).toFixed(2),
    unit: 'USDC',
  }

  const withdrawRequest = {
    id: WithdrawMetrics.WITHDRAW_REQUEST,
    content: parseFloat(amount).toFixed(2),
    unit: 'USDC',
  }

  const trancheInvestment = {
    id: WithdrawMetrics.TRANCHE_INVESTMENT,
    content: parseFloat(trancheBalance).toFixed(2),
    unit: 'USDC',
  }

  const toWallet = {
    id: WithdrawMetrics.TO_WALLET,
    content: userAddress || t('common.unknown'),
  }

  return (
    <>
      <BalanceInfo
        modalStatusAction={modalStatusAction}
        withdrawRequest={withdrawRequest}
        poolData={poolData}
        totalInvestment={totalInvestment}
        className={metricsRowClassName}
      />

      {modalStatusAction === ModalStatusAction.REQUEST && (
        <>
          <Box display='flex' className={metricsRowClassName} pt={1}>
            <Box flex={1} />

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
        </>
      )}

      {modalStatusAction === ModalStatusAction.APPROVE && (
        <ApprovalMetrics
          tranche={tranche}
          toWallet={toWallet}
          isMultiTranche={isMultiTranche}
          className={metricsRowClassName}
        />
      )}
    </>
  )
}

export default WithdrawModalMetrics
