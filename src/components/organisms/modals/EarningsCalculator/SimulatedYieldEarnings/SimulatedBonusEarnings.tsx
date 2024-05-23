import { formatEther } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useSimulateYieldEarnings from '@/hooks/lending/useSimulateYieldEarnings'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { SupportedTokens } from '@/constants/tokens'
import { convertFromUSD, formatAmount, toBigNumber } from '@/utils'

type SimulatedBonusEarningsProps = {
  apyBonus: number
}

const SimulatedBonusEarnings: React.FC<SimulatedBonusEarningsProps> = ({
  apyBonus,
}) => {
  const [bonusYieldEarnings, setBonusYieldEarnings] = useState([0])

  const { t } = useTranslation()

  const { amount, simulatedDuration } = useDepositModalState()

  const { ksuPrice } = useKsuPrice()

  const supportedToken = useSupportedTokenInfo()

  const simulateEarnings = useSimulateYieldEarnings()

  const handleSimulateChange = useCallback(
    (amount: number, apyBonus: number, duration: number) => {
      const bonusYieldEarnings = simulateEarnings(
        amount,
        apyBonus / 100,
        duration
      )

      setBonusYieldEarnings(bonusYieldEarnings)
    },
    [simulateEarnings]
  )

  const { debouncedFunction, isDebouncing } = useDebounce(
    handleSimulateChange,
    2000
  )

  useEffect(() => {
    if (!amount) return

    debouncedFunction(parseFloat(amount), apyBonus, 365)
  }, [amount, apyBonus, debouncedFunction])

  const bonusEarningsInKSU = useMemo(
    () =>
      convertFromUSD(
        toBigNumber(bonusYieldEarnings[simulatedDuration]?.toString() || '0'),
        toBigNumber(
          ksuPrice || '0',
          supportedToken?.[SupportedTokens.USDC].decimals
        )
      ),
    [bonusYieldEarnings, simulatedDuration, ksuPrice, supportedToken]
  )

  return (
    <BalanceItem
      title={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-4-title'
      )}
      toolTipInfo={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-4-tooltip'
      )}
      value={[formatAmount(formatEther(bonusEarningsInKSU)), 'KSU']}
      usdValue={formatAmount(bonusYieldEarnings[simulatedDuration])}
      showSkeleton={isDebouncing}
    />
  )
}

export default SimulatedBonusEarnings
