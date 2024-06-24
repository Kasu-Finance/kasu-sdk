'use client'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'
import useTotalLendingPoolDeposits from '@/hooks/web3/useTotalLendingPoolDeposits'

import CardWidget from '@/components/atoms/CardWidget'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'
import LoyaltyLevelInfo from '@/components/molecules/locking/LoyaltyOverview/LoyaltyLevelInfo'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'
import RksuBalance from '@/components/molecules/tooltips/RksuBalance'
import RksuTooltip from '@/components/molecules/tooltips/RksuTooltip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { capitalize, formatAmount } from '@/utils'

const LoyaltyOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  const { totalDeposits } = useTotalLendingPoolDeposits()
  const { rKsuAmount } = useEarnedRKsu()
  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const isLoyal = currentLevel === 1 || currentLevel === 2

  return (
    <CardWidget
      title={t('locking.widgets.loyalty.title')}
      cardAction={
        <Button
          sx={(theme) => ({
            '& .MuiButton-startIcon > svg > path': {
              fill: theme.palette.primary.main,
            },
          })}
          startIcon={<ArrowForwardIcon />}
          variant='outlined'
          onClick={handleOpen}
        >
          {t('locking.widgets.loyalty.button')}
        </Button>
      }
    >
      <LoyaltyLevelInfo
        rootStyles={{ mb: 2 }}
        title={t(
          `locking.widgets.loyalty.level.level-${
            isLoyal ? currentLevel : 0
          }.title`
        )}
        subtitle={t(
          `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.subtitle`
        )}
        list={[
          t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.list.list-0`
          ),
          t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.list.list-1`
          ),
          t(
            `locking.widgets.loyalty.level.level-${isLoyal ? currentLevel : 0}.list.list-2`
          ),
        ]}
      />
      <InfoRow
        showDivider
        title={`rKSU ${capitalize(t('general.balance'))}`}
        toolTipInfo={<ToolTip title={<RksuBalance />} />}
        metric={
          <TokenAmount amount={formatAmount(rKsuAmount || '0')} symbol='rKSU' />
        }
      />

      <InfoRow
        showDivider
        title={t('locking.widgets.loyalty.metric-2')}
        toolTipInfo={t('locking.widgets.loyalty.metric-2-toolip')}
        metric={
          <TokenAmount
            amount={formatAmount(totalDeposits.activeDepositAmount || '0')}
            symbol='USDC'
          />
        }
      />

      <InfoRow
        showDivider
        title={t('locking.widgets.loyalty.metric-3')}
        toolTipInfo={<ToolTip title={<RksuTooltip />} />}
        metric={
          <Typography variant='h6' component='span'>
            {formatAmount(stakedPercentage || '0', {
              maxDecimals: 2,
            })}
            %
          </Typography>
        }
      />
      <LoyaltyProgress stakedPercentage={stakedPercentage} />
    </CardWidget>
  )
}

export default LoyaltyOverview
