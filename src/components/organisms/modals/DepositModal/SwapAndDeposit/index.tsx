import useModalStatusState from '@/hooks/context/useModalStatusState'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import ColoredBox from '@/components/atoms/ColoredBox'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import SwapAndDepositSelect from '@/components/molecules/SwapAndDeposit/SwapAndDepositSelect'
import SwapAndDepositInput from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount/SwapAndDepositInput'

type SwapAndDepositProps = {
  poolData: PoolData
  title: string
}

const SwapAndDeposit: React.FC<SwapAndDepositProps> = ({ poolData, title }) => {
  const { modalStatus } = useModalStatusState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  return (
    <>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <SwapAndDepositSelect
          title={title}
          supportedTokenUserBalances={supportedTokenUserBalances}
        />
      </ColoredBox>
      <SwapAndDepositInput
        supportedTokenUserBalance={supportedTokenUserBalances}
        poolData={poolData}
      />
    </>
  )
}

export default SwapAndDeposit
