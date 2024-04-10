import { useWeb3React } from '@web3-react/core'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ApprovalMetrics from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawModalMetrics/ApprovalMetrics'
import CommonMetrics from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawModalMetrics/CommonMetrics'
import TotalInvestmentInfo from '@/components/organisms/modals/WithdrawModal/WithdrawModalRequest/WithdrawModalMetrics/TotalInvestmentInfo'

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
    content: poolBalance,
    unit: 'USDC',
  }

  const trancheInvestment = {
    id: WithdrawMetrics.TRANCHE_INVESTMENT,
    content: trancheBalance,
    unit: 'USDC',
  }

  const toWallet = {
    id: WithdrawMetrics.TO_WALLET,
    content: userAddress || t('common.unknown'),
  }

  return (
    <>
      <TotalInvestmentInfo
        poolData={poolData}
        totalInvestment={totalInvestment}
        className={metricsRowClassName}
      />
      {modalStatusAction === ModalStatusAction.REQUEST && isMultiTranche && (
        <CommonMetrics
          metrics={[trancheInvestment]}
          className={metricsRowClassName}
        />
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
