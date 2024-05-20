import { Grid, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'
import useUserBalance from '@/hooks/web3/useUserBalance'

import InfoColumn from '@/components/atoms/InfoColumn'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { USDC } from '@/config/sdk'
import { formatAmount } from '@/utils'

type SimulatedDepositDefaultProps = {
  loyaltyLabel: string
  setSelectedBalance: Dispatch<SetStateAction<string>>
}

const SimulatedDepositDefault: React.FC<SimulatedDepositDefaultProps> = ({
  loyaltyLabel,
  setSelectedBalance,
}) => {
  const { t } = useTranslation()

  const { balance, decimals } = useUserBalance(USDC)

  const userBalance = useMemo(
    () => formatUnits(balance || '0', decimals),
    [balance, decimals]
  )
  useEffect(() => {
    setSelectedBalance(userBalance)
  }, [userBalance, setSelectedBalance])

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <BalanceItem
          title={t('general.availableFunds')}
          toolTipInfo={t(
            'modals.earningsCalculator.simulatedAmount.metric-1-tooltip'
          )}
          value={[formatAmount(userBalance || '0'), 'USDC']}
        />
      </Grid>
      <Grid item xs={6}>
        <InfoColumn
          title={t('general.loyaltyLevel')}
          titleStyle={{ textTransform: 'capitalize' }}
          showDivider
          toolTipInfo={t(
            'modals.earningsCalculator.simulatedAmount.metric-2-tooltip'
          )}
          metric={
            <Typography
              variant='h6'
              component='span'
              display='block'
              pt='6px'
              pl={2}
            >
              {loyaltyLabel}
            </Typography>
          }
        />
      </Grid>
    </Grid>
  )
}

export default SimulatedDepositDefault
