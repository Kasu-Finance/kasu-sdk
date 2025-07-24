import { Skeleton, Typography } from '@mui/material'
import { Dispatch, memo, SetStateAction, useEffect, useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useSimulateYieldEarnings from '@/hooks/lending/useSimulateYieldEarnings'
import getTranslation from '@/hooks/useTranslation'
import usePerformanceFee from '@/hooks/web3/usePerformanceFee'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount } from '@/utils'

type SimulatedDefaultEarningsProps = {
  yieldEarnings: number[]
  setYieldEarnings: Dispatch<SetStateAction<number[]>>
  amount: string
  amountInUSD?: string
  trancheId: `0x${string}`
  fixedTermConfigId?: string
  simulatedDuration: number
  isDebouncing: boolean
}

const SimulatedDefaultEarnings: React.FC<SimulatedDefaultEarningsProps> = ({
  amount,
  simulatedDuration,
  trancheId,
  amountInUSD,
  fixedTermConfigId,
  yieldEarnings,
  isDebouncing,
  setYieldEarnings,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const { performanceFee } = usePerformanceFee()

  const simulateEarnings = useSimulateYieldEarnings()

  const selectedInterestRate = useMemo(() => {
    const selectedTranche = pool.tranches.find(
      (tranche) => tranche.id === trancheId
    )

    if (!selectedTranche?.fixedTermConfig.length)
      return selectedTranche?.interestRate

    const fixedTermApy = selectedTranche.fixedTermConfig.find(
      ({ configId }) => configId === fixedTermConfigId
    )

    return fixedTermApy?.epochInterestRate
  }, [pool.tranches, trancheId, fixedTermConfigId])

  useEffect(() => {
    if (!amount || !selectedInterestRate || !performanceFee) {
      setYieldEarnings([0])
      return
    }

    const simulatedEarnings = simulateEarnings(
      parseFloat(amountInUSD ?? amount),
      parseFloat(selectedInterestRate),
      365,
      performanceFee / 100
    )

    setYieldEarnings(simulatedEarnings)
  }, [
    amount,
    performanceFee,
    amountInUSD,
    selectedInterestRate,
    simulateEarnings,
    setYieldEarnings,
  ])

  return (
    <InfoRow
      title={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-2-title'
      )}
      toolTipInfo={
        <ToolTip
          title={t(
            'modals.earningsCalculator.simulatedYieldEarnings.metric-2-tooltip'
          )}
          iconSx={{
            color: 'gold.extraDark',
            '&:hover': {
              color: 'rgba(133, 87, 38, 1)',
            },
          }}
        />
      }
      showDivider
      dividerProps={{
        color: 'white',
      }}
      metric={
        isDebouncing ? (
          <Skeleton
            variant='rounded'
            sx={{ bgcolor: 'gold.extraDark' }}
            width={90}
            height={24}
          />
        ) : (
          <Typography variant='baseMdBold'>
            {formatAmount(yieldEarnings[simulatedDuration] || 0, {
              minDecimals: 2,
            })}
            USDC
          </Typography>
        )
      }
    />
  )
}

export default memo(SimulatedDefaultEarnings)
