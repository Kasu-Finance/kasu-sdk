'use client'

import { Divider, Grid, Typography } from '@mui/material'
import { ethers } from 'ethers'

import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'
import getTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import UserLendingTrancheDetailSkeleton from '@/components/organisms/lending/OverviewTab/UserLending/UserLendingTrancheDetailSkeleton'

import { formatAmount, formatPercentage } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type UserLendingTrancheDetailProps = {
  pool: PoolOverviewWithDelegate
}

const UserLendingTrancheDetail: React.FC<UserLendingTrancheDetailProps> = ({
  pool,
}) => {
  const { t } = getTranslation()

  const { userLendingTrancheBalance, isLoading } = useUserLendingTrancheBalance(
    pool.id,
    pool.tranches.toReversed()
  )

  if (isLoading) {
    return <UserLendingTrancheDetailSkeleton />
  }

  const dataWithFallback = pool.tranches.toReversed().map((tranche) => ({
    ...tranche,
    balanceData: {
      address: tranche.id,
      userId: ethers.constants.AddressZero,
      availableToWithdraw: '0',
      balance: '0',
      yieldEarned: 0,
    },
  }))

  return (
    <Grid container spacing={4} mt={2}>
      {(userLendingTrancheBalance ?? dataWithFallback).map((tranche) => (
        <Grid item flex={1} key={tranche.id}>
          <Typography variant='h5'>
            {tranche.name} {t('general.tranche')}
          </Typography>
          <Divider sx={{ mt: 1.5 }} />
          <InfoRow
            title={t(
              'lending.poolOverview.investmentCard.amountInvested.label'
            )}
            toolTipInfo={t(
              'lending.poolOverview.investmentCard.amountInvested.tooltip'
            )}
            titleStyle={{
              variant: 'baseMd',
            }}
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(tranche.balanceData.balance)} USDC
              </Typography>
            }
            showDivider
          />
          <InfoRow
            title={t('lending.poolOverview.investmentCard.trancheApy.label')}
            toolTipInfo={t(
              'lending.poolOverview.investmentCard.trancheApy.tooltip'
            )}
            titleStyle={{
              variant: 'baseMd',
            }}
            metric={
              <Typography variant='baseMdBold'>
                {formatPercentage(tranche.apy)}
              </Typography>
            }
            showDivider
          />
          <InfoRow
            title={t('lending.poolOverview.investmentCard.yieldEarned.label')}
            toolTipInfo={t(
              'lending.poolOverview.investmentCard.yieldEarned.tooltip'
            )}
            titleStyle={{
              variant: 'baseMd',
            }}
            metric={
              <Typography variant='baseMdBold'>
                {formatAmount(tranche.balanceData.yieldEarned)} USDC
              </Typography>
            }
            showDivider
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default UserLendingTrancheDetail
