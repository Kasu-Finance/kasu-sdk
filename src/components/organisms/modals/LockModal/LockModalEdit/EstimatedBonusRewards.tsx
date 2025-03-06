import { Box, Typography } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useAvailableKsuBonus from '@/hooks/locking/useAvailableKsuBonus'
import useCalculateLaunchBonusAmount from '@/hooks/locking/useCalculateLaunchBonusAmount'
import useProjectedUsdcEarning from '@/hooks/locking/useProjectedUsdcEarning'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import ModalLaunchBonus from '@/components/molecules/tooltips/ModalLaunchBonus'

import { formatAmount } from '@/utils'

const EstimatedBonusRewards = () => {
  const { t } = getTranslation()
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

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2}>
      <Typography variant='h4' textAlign='center'>
        {t('modals.lock.estimates.title')}
      </Typography>
      <Box>
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
            <Typography variant='baseMdBold'>
              {formatAmount(disabled ? '0' : projectedUsdcEarning, {
                minValue: 100_000_000_000,
              })}{' '}
              USDC
            </Typography>
          }
        />
        <InfoRow
          title={t('modals.lock.estimates.est-2')}
          toolTipInfo={
            <ToolTip
              title={t('modals.lock.estimates.tooltip-2')}
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
            <Typography variant='baseMdBold'>
              {formatAmount('0', {
                minValue: 100_000_000_000,
              })}{' '}
              KASU
            </Typography>
          }
        />
        <InfoRow
          title={t('modals.lock.estimates.est-3')}
          toolTipInfo={
            <ToolTip
              title={<ModalLaunchBonus />}
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
            <Typography variant='baseMdBold'>
              {formatAmount(disabled ? '0' : estimatedLaunchBonus, {
                minValue: 100_000_000_000,
              })}{' '}
              KASU
            </Typography>
          }
        />
      </Box>
    </Box>
  )
}

export default EstimatedBonusRewards
