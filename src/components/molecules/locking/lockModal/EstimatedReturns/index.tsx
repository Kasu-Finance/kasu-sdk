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
import ToolTip from '@/components/atoms/ToolTip'
import ModalLaunchBonus from '@/components/molecules/tooltips/ModalLaunchBonus'

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
          toolTipInfo={
            <ToolTip
              title={
                <>
                  {t('modals.lock.estimates.tooltip-1-1')}
                  <br /> <br />
                  {t('modals.lock.estimates.tooltip-1-2')}
                </>
              }
            />
          }
          metric={
            <TokenAmount
              color={(theme) =>
                getTextColor(theme, toBigNumber(projectedUsdcEarning).isZero())
              }
              amount={formatAmount(disabled ? '0' : projectedUsdcEarning, {
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
                minValue: 100_000_000_000,
              })}
              symbol='KSU'
            />
          }
          showDivider
        />
        <InfoRow
          title={t('modals.lock.estimates.est-3')}
          toolTipInfo={<ToolTip title={<ModalLaunchBonus />} />}
          metric={
            <TokenAmount
              color={(theme) =>
                getTextColor(theme, toBigNumber(estimatedLaunchBonus).isZero())
              }
              amount={formatAmount(disabled ? '0' : estimatedLaunchBonus, {
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
