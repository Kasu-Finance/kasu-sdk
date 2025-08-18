import { Typography } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import React, { memo } from 'react'

import useMinimumLockAmount from '@/hooks/locking/useMinimumLockAmount'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import LiteModeSkeleton from '@/components/atoms/LiteModeSkeleton'
import ToolTip from '@/components/atoms/ToolTip'
import LendingLoyalityLevelsTooltip from '@/components/molecules/tooltips/LendingLoyalityLevelsTooltip'
import MinKsuLockLoyalityOne from '@/components/molecules/tooltips/MinKsuLockLoyalityOne'
import MinKsuLockLoyalityTwo from '@/components/molecules/tooltips/MinKsuLockLoyalityTwo'

import { formatAmount } from '@/utils'

type MinRequiredLockAmountProps = {
  selectedLockPeriod: LockPeriod
}

const MinRequiredLockAmount: React.FC<MinRequiredLockAmountProps> = ({
  selectedLockPeriod,
}) => {
  const { t } = getTranslation()

  const { level_1_min, level_2_min, isLoading } = useMinimumLockAmount()

  return (
    <>
      <InfoRow
        title={t('modals.lock.deposit.amount-metric-1')}
        toolTipInfo={
          <ToolTip
            title={<MinKsuLockLoyalityOne />}
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
          isLoading ? (
            <LiteModeSkeleton width={100} />
          ) : (
            <Typography variant='baseMdBold'>
              {formatAmount(
                parseFloat(level_1_min) /
                  parseFloat(selectedLockPeriod.rKSUMultiplier),
                { minDecimals: 2 }
              )}{' '}
              KASU
            </Typography>
          )
        }
      />
      <InfoRow
        title={t('modals.lock.deposit.amount-metric-2')}
        toolTipInfo={
          <ToolTip
            title={<MinKsuLockLoyalityTwo />}
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
          isLoading ? (
            <LiteModeSkeleton width={100} />
          ) : (
            <Typography variant='baseMdBold'>
              {formatAmount(
                parseFloat(level_2_min) /
                  parseFloat(selectedLockPeriod.rKSUMultiplier),
                { minDecimals: 2 }
              )}{' '}
              KASU
            </Typography>
          )
        }
      />
      <Typography variant='baseMd' mt={3} display='block'>
        {t('modals.lock.deposit.amount-metric-3')}{' '}
        <ToolTip
          title={<LendingLoyalityLevelsTooltip />}
          iconSx={{
            verticalAlign: 'sub',
            color: 'gold.extraDark',
            '&:hover': {
              color: 'rgba(133, 87, 38, 1)',
            },
          }}
        />{' '}
        {t('modals.lock.deposit.amount-metric-4')}
      </Typography>
    </>
  )
}

export default memo(MinRequiredLockAmount)
