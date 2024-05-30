import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import SwapAndDepositInfo from '@/components/molecules/SwapAndDeposit/SwapAndDepositInfo'
import SwapAndDeposit from '@/components/organisms/modals/DepositModal/SwapAndDeposit'

type SimulatedSwapAndDepositProps = {
  poolData: PoolData
}

const SimulatedSwapAndDeposit: React.FC<SimulatedSwapAndDepositProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  return (
    <>
      <SwapAndDeposit
        poolData={poolData}
        title={t('modals.earningsCalculator.simulatedAmount.metric-1')}
      />
      <SwapAndDepositInfo
        supportedTokenUserBalance={supportedTokenUserBalances}
      />
    </>
  )
}

export default SimulatedSwapAndDeposit
