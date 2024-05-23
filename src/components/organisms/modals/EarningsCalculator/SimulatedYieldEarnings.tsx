import { Box, Grid, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatEther } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useSimulateYieldEarnings from '@/hooks/lending/useSimulateYieldEarnings'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { SupportedTokens } from '@/constants/tokens'
import {
  convertFromUSD,
  formatAmount,
  formatPercentage,
  toBigNumber,
} from '@/utils'

type SimulatedYieldEarningsProps = {
  loyaltyLevel: LoyaltyLevel
  poolOverview: PoolOverview
}

const SimulatedYieldEarnings: React.FC<SimulatedYieldEarningsProps> = ({
  loyaltyLevel,
  poolOverview,
}) => {
  const [simulatedValue, setSimulatedValue] = useState({
    yieldEarnings: [0],
    bonusYieldEarnings: [0],
  })

  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const { amount, trancheId, simulatedDuration } = useDepositModalState()

  const { ksuPrice } = useKsuPrice()

  const supportedToken = useSupportedTokenInfo()

  const simulateEarnings = useSimulateYieldEarnings()

  const isLoyal = useMemo(
    () => loyaltyLevel === 1 || loyaltyLevel === 2,
    [loyaltyLevel]
  )

  const selectedTranche = useMemo(
    () => poolOverview.tranches.find((tranche) => tranche.id === trancheId),
    [poolOverview.tranches, trancheId]
  )

  const apyBonus = useMemo(
    () => (loyaltyLevel === 1 ? 0.1 : loyaltyLevel === 2 ? 0.2 : 0.2),
    [loyaltyLevel]
  )

  const handleSimulateChange = useCallback(
    (amount: number, apy: number, apyBonus: number, duration: number) => {
      const yieldEarnings = simulateEarnings(amount, apy, duration)

      const bonusYieldEarnings = simulateEarnings(
        amount,
        apyBonus / 100,
        duration
      )

      setSimulatedValue({ yieldEarnings, bonusYieldEarnings })
    },
    [simulateEarnings]
  )

  const { debouncedFunction: handleDebouncedChange, isDebouncing } =
    useDebounce(handleSimulateChange, 2000)

  useEffect(() => {
    if (!amount || !selectedTranche?.apy) return

    handleDebouncedChange(
      parseFloat(amount),
      parseFloat(selectedTranche.apy),
      apyBonus,
      365
    )
  }, [amount, apyBonus, selectedTranche?.apy, handleDebouncedChange])

  const bonusEarningsInKSU = useMemo(
    () =>
      convertFromUSD(
        toBigNumber(
          simulatedValue.bonusYieldEarnings[simulatedDuration].toString()
        ),
        toBigNumber(
          ksuPrice || '0',
          supportedToken?.[SupportedTokens.USDC].decimals
        )
      ),
    [
      simulatedValue.bonusYieldEarnings,
      simulatedDuration,
      ksuPrice,
      supportedToken,
    ]
  )

  return (
    <Box mt={4}>
      <Typography variant='subtitle1' component='span'>
        {t('modals.earningsCalculator.simulatedDuration.title')}
      </Typography>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InfoColumn
              title={t('general.apy')}
              subtitle={`(${t('general.base')})`}
              subtitleStyle={{
                variant: 'caption',
                textTransform: 'capitalize',
              }}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-1-tooltip'
              )}
              showDivider
              metric={
                <Box pt='6px' pl={2}>
                  <Typography variant='h6' component='span'>
                    {formatPercentage(selectedTranche?.apy || 0)}
                  </Typography>
                </Box>
              }
            />
            ``
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-2-title'
              )}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-2-tooltip'
              )}
              value={[
                formatAmount(simulatedValue.yieldEarnings[simulatedDuration]),
                'USDC',
              ]}
              showSkeleton={isDebouncing}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoColumn
              title={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-3-title'
              )}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-3-tooltip'
              )}
              showDivider
              metric={
                <Box pt='6px' pl={2}>
                  <Typography variant='h6' component='span'>
                    {formatPercentage(apyBonus / 100)}
                  </Typography>
                  <Typography
                    display='block'
                    variant='body1'
                    component='span'
                    color={(theme) => theme.palette.text.secondary}
                  >
                    {isLoyal
                      ? loyaltyLevel.toString()
                      : t('locking.widgets.loyalty.level.level-0.title')}
                  </Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-4-title'
              )}
              toolTipInfo={t(
                'modals.earningsCalculator.simulatedYieldEarnings.metric-4-tooltip'
              )}
              value={[formatAmount(formatEther(bonusEarningsInKSU)), 'KSU']}
              usdValue={formatAmount(
                simulatedValue.bonusYieldEarnings[simulatedDuration]
              )}
              showSkeleton={isDebouncing}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Box>
  )
}

export default SimulatedYieldEarnings
