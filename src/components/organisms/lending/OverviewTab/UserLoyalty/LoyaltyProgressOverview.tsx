'use client'

import { Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useStakedKSU from '@/hooks/locking/useStakedKSU'
import getTranslation from '@/hooks/useTranslation'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import RksuBalance from '@/components/molecules/tooltips/RksuBalance'
import RksuTooltip from '@/components/molecules/tooltips/RksuTooltip'
import LoyaltyProgress from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgress'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, formatAmount } from '@/utils'

const LoyaltyProgressOverview = () => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const { rKsuAmount } = useEarnedRKsu()

  const { stakedPercentage } = useLockingPercentage()

  const { stakedKSU } = useStakedKSU()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Stack spacing={2} height='100%'>
      <Stack height='100%'>
        <LoyaltyProgress />
        <InfoRow
          title={`rKASU ${capitalize(t('general.balance'))}`}
          toolTipInfo={
            <ToolTip
              slotProps={{
                tooltip: {
                  sx: {
                    maxWidth: 400,
                  },
                },
              }}
              title={<RksuBalance />}
            />
          }
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(rKsuAmount || '0', { minDecimals: 2 })} rKASU
            </Typography>
          }
          sx={{ mt: 'auto' }}
        />
        <InfoRow
          title={t('locking.widgets.loyalty.metric-3')}
          toolTipInfo={<ToolTip title={<RksuTooltip />} />}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(stakedPercentage || '0', {
                minDecimals: 2,
              })}
              %
            </Typography>
          }
        />
        <InfoRow
          title={t('lending.poolOverview.lockingStatus.lockedInfo.label')}
          toolTipInfo={t(
            'lending.poolOverview.lockingStatus.lockedInfo.tooltip'
          )}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(stakedKSU || '0')} KASU
            </Typography>
          }
        />
      </Stack>
      <Button
        variant='outlined'
        fullWidth
        sx={{
          maxWidth: 368,
          textTransform: 'capitalize',
          alignSelf: 'flex-end',
        }}
        onClick={handleOpen}
      >
        Learn About KASU Loyalty
      </Button>
    </Stack>
  )
}

export default LoyaltyProgressOverview
