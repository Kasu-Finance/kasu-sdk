import { Box, Skeleton, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useSimulateBonusYieldEarnings from '@/hooks/lending/useSimulateBonusYieldEarnings'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { convertFromUSD, formatAmount, toBigNumber } from '@/utils'

type SimulatedBonusEarningsProps = {
  yieldEarnings: number[]
  bonusEpochInterest: number
}

const SimulatedBonusEarnings: React.FC<SimulatedBonusEarningsProps> = ({
  yieldEarnings,
  bonusEpochInterest,
}) => {
  const { t } = useTranslation()

  const [bonusYieldEarnings, setBonusYieldEarnings] = useState([0])

  const { amount, amountInUSD, simulatedDuration, isDebouncing } =
    useDepositModalState()

  const { ksuPrice } = useKsuPrice()

  const simulateEarnings = useSimulateBonusYieldEarnings()

  const bonusEarningsInKSU = useMemo(
    () =>
      convertFromUSD(
        toBigNumber(bonusYieldEarnings[simulatedDuration]?.toString() || '0'),
        toBigNumber(ksuPrice || '0')
      ),
    [bonusYieldEarnings, simulatedDuration, ksuPrice]
  )

  useEffect(() => {
    if (!amount) {
      setBonusYieldEarnings([0])
      return
    }

    const simulatedEarnings = simulateEarnings(
      yieldEarnings,
      parseFloat(amountInUSD ?? amount),
      bonusEpochInterest
    )

    setBonusYieldEarnings(simulatedEarnings)
  }, [amount, amountInUSD, yieldEarnings, bonusEpochInterest, simulateEarnings])

  return (
    <InfoRow
      title={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-4-title'
      )}
      toolTipInfo={
        <ToolTip
          title={t(
            'modals.earningsCalculator.simulatedYieldEarnings.metric-4-tooltip'
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
            width={140}
            height={24}
          />
        ) : (
          <Box>
            <Typography variant='baseMdBold' mr='1ch'>
              {formatAmount(formatEther(bonusEarningsInKSU), {
                minDecimals: 2,
              })}{' '}
              KSU
            </Typography>
            <Typography variant='baseMd' color='rgba(133, 87, 38, 1)'>
              {formatAmount(bonusYieldEarnings[simulatedDuration] || 0, {
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          </Box>
        )
      }
    />
  )
}

export default SimulatedBonusEarnings
