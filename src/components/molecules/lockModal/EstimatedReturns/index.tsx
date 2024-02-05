import { Box, Divider, Typography } from '@mui/material'
import { LockPeriod } from 'kasu-sdk/src/types'
import React from 'react'

import useAvailableKsuBonus from '@/hooks/locking/useAvailableKsuBonus'
import useCalculateLaunchBonusAmount from '@/hooks/locking/useCalculateLaunchBonusAmount'
import useEstimatedDepositValue from '@/hooks/locking/useEstimatedDepositValue'
import useProjectedApy from '@/hooks/locking/useProjectedApy'
import useProjectedUsdcEarning from '@/hooks/locking/useProjectedUsdcEarning'

import ColoredBox from '@/components/atoms/ColoredBox'

import { formatAmount } from '@/utils'

import EstimatesRow from './EstimatesRow'

type EstimatedReturnsProps = {
  amount: string
  lockPeriod: LockPeriod
}

const EstimatedReturns: React.FC<EstimatedReturnsProps> = ({
  amount,
  lockPeriod,
}) => {
  const estimatedDepositValueUSD = useEstimatedDepositValue(amount)

  const { availableKsuBonus } = useAvailableKsuBonus()

  const estimatedLaunchBonus = useCalculateLaunchBonusAmount(
    amount || '0',
    Number(lockPeriod.ksuBonusMultiplier),
    availableKsuBonus ?? '0'
  )

  const projectedApy = useProjectedApy()
  const projectedUsdcEarning = useProjectedUsdcEarning()

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        Estimates
      </Typography>
      <ColoredBox mt={1}>
        <EstimatesRow
          title='Deposit value in USD at current exchange rate'
          info='info'
          value={formatAmount(estimatedDepositValueUSD, {
            currency: 'USD',
            minDecimals: 2,
          })}
        />
        <Divider />
        <EstimatesRow
          title='Launch Bonus KASU from locking'
          info='info'
          value={`${formatAmount(estimatedLaunchBonus, {
            minDecimals: 2,
          })} KSU`}
        />
        <Divider />
        <EstimatesRow
          title='Projected APY'
          info='info'
          value={`${projectedApy} %`}
        />
        <Divider />
        <EstimatesRow
          title='Projected USDC earning at current APY'
          info='info'
          value={`${projectedUsdcEarning} USDC`}
        />
      </ColoredBox>
    </Box>
  )
}

export default EstimatedReturns
