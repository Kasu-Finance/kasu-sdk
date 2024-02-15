import { Box, Divider, Typography } from '@mui/material'
import { LockPeriod } from 'kasu-sdk/src/types'
import React from 'react'

import useAvailableKsuBonus from '@/hooks/locking/useAvailableKsuBonus'
import useCalculateLaunchBonusAmount from '@/hooks/locking/useCalculateLaunchBonusAmount'
import useEstimatedDepositValue from '@/hooks/locking/useEstimatedDepositValue'
import useProjectedApy from '@/hooks/locking/useProjectedApy'
import useProjectedUsdcEarning from '@/hooks/locking/useProjectedUsdcEarning'
import useTranslation from '@/hooks/useTranslation'

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
  const { t } = useTranslation()

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
      <Typography
        variant='subtitle1'
        component='span'
        display='block'
        sx={{ textTransform: 'capitalize' }}
      >
        {t('modals.lock.estimates.title')}
      </Typography>
      <ColoredBox mt={1}>
        <EstimatesRow
          title={t('modals.lock.estimates.est-1')}
          toolTipInfo={t('modals.lock.estimates.tooltip-1')}
          value={formatAmount(estimatedDepositValueUSD, {
            currency: 'USD',
            minDecimals: 2,
          })}
        />
        <Divider />
        <EstimatesRow
          title={t('modals.lock.estimates.est-2')}
          toolTipInfo={t('modals.lock.estimates.tooltip-2')}
          value={`${formatAmount(estimatedLaunchBonus, {
            minDecimals: 2,
          })} KSU`}
        />
        <Divider />
        <EstimatesRow
          title={t('modals.lock.estimates.est-3')}
          toolTipInfo={t('modals.lock.estimates.tooltip-3')}
          value={`${projectedApy} %`}
        />
        <Divider />
        <EstimatesRow
          title={t('modals.lock.estimates.est-4')}
          toolTipInfo={t('modals.lock.estimates.tooltip-4')}
          value={`${projectedUsdcEarning} USDC`}
        />
      </ColoredBox>
    </Box>
  )
}

export default EstimatedReturns
