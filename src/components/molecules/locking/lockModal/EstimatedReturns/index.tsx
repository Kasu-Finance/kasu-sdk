import { alpha, Box, Theme, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useAvailableKsuBonus from '@/hooks/locking/useAvailableKsuBonus'
import useCalculateLaunchBonusAmount from '@/hooks/locking/useCalculateLaunchBonusAmount'
import useProjectedUsdcEarning from '@/hooks/locking/useProjectedUsdcEarning'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const EstimatedReturns = () => {
  const { t } = useTranslation()

  const { amount, selectedLockPeriod, lockState } = useLockModalState()

  const { availableKsuBonus } = useAvailableKsuBonus()

  const estimatedLaunchBonus = useCalculateLaunchBonusAmount(
    amount || '0',
    Number(selectedLockPeriod.ksuBonusMultiplier),
    availableKsuBonus ?? '0'
  )

  const projectedUsdcEarning = useProjectedUsdcEarning()

  const disabled = lockState.type === 'error'

  const getTextColor = (theme: Theme) =>
    disabled ? theme.palette.text.disabled : undefined

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
      <ColoredBox
        mt={1}
        sx={(theme) => ({
          bgcolor: disabled ? alpha(theme.palette.error.main, 0.04) : undefined,
        })}
      >
        <InfoRow
          title={t('modals.lock.estimates.est-1')}
          toolTipInfo={t('modals.lock.estimates.tooltip-1')}
          metric={
            <Typography variant='h6' component='span' color={getTextColor}>
              {disabled ? '0.00' : '0.15'} ✕
            </Typography>
          }
          showDivider
        />
        <InfoRow
          title={t('modals.lock.estimates.est-2')}
          toolTipInfo={t('modals.lock.estimates.tooltip-2')}
          metric={
            <Box color={getTextColor}>
              <TokenAmount
                amount={formatAmount(disabled ? '0' : projectedUsdcEarning, {
                  minDecimals: 2,
                  minValue: 100_000_000_000,
                })}
                symbol='USDC'
              />
            </Box>
          }
          showDivider
        />
        <InfoRow
          title={t('modals.lock.estimates.est-3')}
          toolTipInfo={t('modals.lock.estimates.tooltip-3')}
          metric={
            <Box color={getTextColor}>
              <TokenAmount
                amount={formatAmount(disabled ? '0' : estimatedLaunchBonus, {
                  minDecimals: 2,
                  minValue: 100_000_000_000,
                })}
                symbol='KSU'
              />
            </Box>
          }
        />
      </ColoredBox>
    </Box>
  )
}

export default EstimatedReturns
