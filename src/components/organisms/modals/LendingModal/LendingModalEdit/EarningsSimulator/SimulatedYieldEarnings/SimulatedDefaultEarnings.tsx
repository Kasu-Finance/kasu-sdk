import { Skeleton, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useSimulateYieldEarnings from '@/hooks/lending/useSimulateYieldEarnings'
import useTranslation from '@/hooks/useTranslation'
import usePerformanceFee from '@/hooks/web3/usePerformanceFee'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount } from '@/utils'

type SimulatedDefaultEarningsProps = {
  yieldEarnings: number[]
  setYieldEarnings: Dispatch<SetStateAction<number[]>>
}

const SimulatedDefaultEarnings: React.FC<SimulatedDefaultEarningsProps> = ({
  yieldEarnings,
  setYieldEarnings,
}) => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const pool = modal[ModalsKeys.LEND].pool

  const { amount, amountInUSD, trancheId, simulatedDuration, isDebouncing } =
    useDepositModalState()

  const { performanceFee } = usePerformanceFee()

  const simulateEarnings = useSimulateYieldEarnings()

  const selectedTranche = useMemo(
    () => pool.tranches.find((tranche) => tranche.id === trancheId),
    [pool.tranches, trancheId]
  )

  useEffect(() => {
    if (!amount || !selectedTranche?.interestRate || !performanceFee) {
      setYieldEarnings([0])
      return
    }

    const simulatedEarnings = simulateEarnings(
      parseFloat(amountInUSD ?? amount),
      parseFloat(selectedTranche.interestRate),
      365,
      performanceFee / 100
    )

    setYieldEarnings(simulatedEarnings)
  }, [
    amount,
    performanceFee,
    amountInUSD,
    selectedTranche?.interestRate,
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

export default SimulatedDefaultEarnings
