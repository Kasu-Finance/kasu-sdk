import { Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import ColoredBox from '@/components/atoms/ColoredBox'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import SwapAndDepositInfo from '@/components/molecules/SwapAndDeposit/SwapAndDepositInfo'
import SwapAndDepositSelect from '@/components/molecules/SwapAndDeposit/SwapAndDepositSelect'
import SimulatedAmountInput from '@/components/organisms/modals/EarningsCalculator/SimulatedDepositAmount/SimulatedAmountInput'

import { UsdcIcon } from '@/assets/icons'
import FallbackIcon from '@/assets/icons/tokens/FallbackIcon'

import { SupportedTokens } from '@/constants/tokens'

type SimulatedSwapAndDepositProps = {
  poolData: PoolData
}

const SimulatedSwapAndDeposit: React.FC<SimulatedSwapAndDepositProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const supportedTokens = {
    [SupportedTokens.ETH]: {
      symbol: 'ETH',
      name: 'Wrapper Ether',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
      decimals: 18,
      icon: FallbackIcon(),
    },
    [SupportedTokens.USDC]: {
      symbol: SupportedTokens.USDC,
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
      decimals: 6,
      icon: UsdcIcon(),
    },
    [SupportedTokens.USDT]: {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xea3983Fc6D0fbbC41fb6F6091f68F3e08894dC06' as `0x${string}`,
      decimals: 18,
      icon: FallbackIcon(),
    },
  } as const

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const { setAmount, setAmountInUSD } = useDepositModalState()

  const [selectedToken, setSelectedToken] = useState(SupportedTokens.USDC)

  useEffect(() => {
    // reset values
    setAmount('')
    setAmountInUSD(undefined)
    setModalStatus({ type: 'default' })
  }, [selectedToken, setAmount, setAmountInUSD, setModalStatus])

  return (
    <>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <SwapAndDepositSelect
          title={t('modals.earningsCalculator.simulatedAmount.metric-1')}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          supportedTokenUserBalances={supportedTokenUserBalances}
        />
      </ColoredBox>
      {supportedTokenUserBalances && supportedTokens?.[SupportedTokens.USDC] ? (
        <SimulatedAmountInput
          supportedTokenUserBalance={supportedTokenUserBalances[selectedToken]}
          usdcInfo={supportedTokens[SupportedTokens.USDC]}
          poolData={poolData}
        />
      ) : (
        <Skeleton variant='rounded' height={60} />
      )}
      {selectedToken !== SupportedTokens.USDC && supportedTokenUserBalances && (
        <SwapAndDepositInfo
          supportedTokenUserBalance={supportedTokenUserBalances[selectedToken]}
        />
      )}
    </>
  )
}

export default SimulatedSwapAndDeposit
