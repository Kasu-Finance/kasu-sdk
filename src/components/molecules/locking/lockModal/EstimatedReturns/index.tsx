import { Box, Theme, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useAvailableKsuBonus from '@/hooks/locking/useAvailableKsuBonus'
import useCalculateLaunchBonusAmount from '@/hooks/locking/useCalculateLaunchBonusAmount'
import useProjectedUsdcEarning from '@/hooks/locking/useProjectedUsdcEarning'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, toBigNumber } from '@/utils'

const EstimatedReturns = () => {
  const { t } = useTranslation()

  const { amount, selectedLockPeriod } = useLockModalState()

  const { modalStatus } = useModalStatusState()

  const { availableKsuBonus } = useAvailableKsuBonus()

  const estimatedLaunchBonus = useCalculateLaunchBonusAmount(
    amount || '0',
    Number(selectedLockPeriod.ksuBonusMultiplier),
    availableKsuBonus ?? '0'
  )

  const projectedUsdcEarning = useProjectedUsdcEarning()

  const disabled = modalStatus.type === 'error'

  const getTextColor = (theme: Theme, state?: boolean) =>
    disabled || state ? theme.palette.text.disabled : undefined

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
        sx={{
          bgcolor: modalStatus.bgColor,
        }}
      >
        <InfoRow
          title={t('modals.lock.estimates.est-1')}
          toolTipInfo={t('modals.lock.estimates.tooltip-1')}
          metric={
            <TokenAmount
              color={(theme) =>
                getTextColor(theme, toBigNumber(projectedUsdcEarning).isZero())
              }
              amount={formatAmount(disabled ? '0' : projectedUsdcEarning, {
                minDecimals: 2,
                minValue: 100_000_000_000,
              })}
              symbol='USDC'
            />
          }
          showDivider
        />
        <InfoRow
          title={t('modals.lock.estimates.est-2')}
          toolTipInfo={t('modals.lock.estimates.tooltip-2')}
          metric={
            <TokenAmount
              color={(theme) => getTextColor(theme, true)}
              amount={formatAmount('0', {
                minDecimals: 2,
                minValue: 100_000_000_000,
              })}
              symbol='KSU'
            />
          }
          showDivider
        />
        <InfoRow
          title={t('modals.lock.estimates.est-3')}
          toolTipInfo={t('modals.lock.estimates.tooltip-3')}
          metric={
            <TokenAmount
              color={(theme) =>
                getTextColor(theme, toBigNumber(estimatedLaunchBonus).isZero())
              }
              amount={formatAmount(disabled ? '0' : estimatedLaunchBonus, {
                minDecimals: 2,
                minValue: 100_000_000_000,
              })}
              symbol='KSU'
            />
          }
        />
      </ColoredBox>
    </Box>
  )
}

export default EstimatedReturns
