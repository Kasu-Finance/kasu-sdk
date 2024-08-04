'use client'

import { Grid } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { useMemo } from 'react'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'
import ClaimButton from '@/components/molecules/locking/RewardSummary/ClaimButton'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const RewardSummary = () => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const { t } = useTranslation()
  const claimRewards = useClaimLockingRewards()

  const { userBonus } = useUserBonusData()
  const { ksuPrice } = useKsuPrice()

  const totalKsuBonusAndRewards = useMemo(() => {
    if (!userBonus) {
      return '0.00'
    }

    return userBonus?.ksuBonusAndRewards
  }, [userBonus])

  const rewardsInUSD = convertToUSD(
    toBigNumber(totalKsuBonusAndRewards || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const isFeesClaimable = Boolean(
    userBonus && !toBigNumber(userBonus.protocolFeesEarned).isZero()
  )

  return (
    <CardWidget title={t('locking.widgets.rewardsSummary.title')}>
      <Grid container spacing={isMobile ? 1 : 3} columns={{ xs: 6, sm: 12 }}>
        <Grid
          item
          xs={6}
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
        >
          <InfoColumn
            title={t('locking.widgets.rewardsSummary.metric-1')}
            toolTipInfo={t('locking.widgets.rewardsSummary.metric-1-tooltip')}
            titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
            titleContainerSx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                px: 0,
              },
            })}
            showDivider
            metric={
              <TokenAmount
                py='6px'
                px={{ xs: 0, sm: 2 }}
                amount={formatAmount(userBonus?.protocolFeesEarned || '0', {
                  hideTrailingZero: false,
                })}
                symbol='USDC'
              />
            }
          />
          {!isMobile && (
            <ClaimButton onClick={claimRewards} disabled={!isFeesClaimable}>
              {t('general.claim')}
            </ClaimButton>
          )}
        </Grid>
        <Grid item xs={6}>
          <ColoredBox
            sx={(theme) => ({
              p: 0,
              [theme.breakpoints.down('sm')]: {
                p: 1,
              },
            })}
          >
            <InfoColumn
              title={t('locking.widgets.rewardsSummary.metric-2')}
              toolTipInfo={
                <ToolTip
                  title={
                    <>
                      {t('locking.widgets.rewardsSummary.metric-2-toolip-1')}
                      <br />
                      <br />
                      {t('locking.widgets.rewardsSummary.metric-2-toolip-2')}
                      <br />
                      <br />
                      {t('locking.widgets.rewardsSummary.metric-2-toolip-3')}
                    </>
                  }
                />
              }
              titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
              showDivider
              metric={
                <TokenAmount
                  py='6px'
                  px={{ xs: 0, sm: 2 }}
                  amount={formatAmount(totalKsuBonusAndRewards)}
                  symbol='KSU'
                  usdValue={formatAmount(formatEther(rewardsInUSD) || '0')}
                  sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      width: '100%',
                      display: 'flex',
                      alignItems: 'baseline',
                      textAlign: 'left',
                      '.MuiBox-root': {
                        display: 'inline-block',
                        ml: 'auto',
                      },
                    },
                  })}
                />
              }
            />
          </ColoredBox>
          {!isMobile && (
            <ClaimButton onClick={undefined} disabled>
              {t('general.claim')}
            </ClaimButton>
          )}
        </Grid>
      </Grid>
    </CardWidget>
  )
}

export default RewardSummary
