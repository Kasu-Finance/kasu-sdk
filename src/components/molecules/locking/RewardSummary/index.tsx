'use client'

import { Grid } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { useMemo } from 'react'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import ClaimButton from '@/components/molecules/locking/RewardSummary/ClaimButton'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const RewardSummary = () => {
  const { t } = useTranslation()
  const claimRewards = useClaimLockingRewards()

  const { userBonus } = useUserBonusData()
  const { ksuPrice } = useKsuPrice()

  const totalKsuBonusAndRewards = useMemo(() => {
    if (!userBonus) {
      return '0.00'
    }

    return formatAmount(userBonus?.ksuBonusAndRewards)
  }, [userBonus])

  const rewardsInUSD = convertToUSD(
    toBigNumber(totalKsuBonusAndRewards || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const isFeesClaimable = Boolean(
    userBonus && !toBigNumber(userBonus.protocolFeesEarned).isZero()
  )

  return (
    <CardWidget title='Bonus & Rewards Summary​​'>
      <Grid container spacing={3}>
        <Grid
          item
          xs={6}
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
        >
          <InfoColumn
            title='Protocol Fee Sharing Balance'
            toolTipInfo='The amount KSU rewards that can be claimed upon the conclusion of the current Epoch.​'
            showDivider
            metric={
              <TokenAmount
                py='6px'
                px={2}
                amount={formatAmount(userBonus?.protocolFeesEarned, {
                  hideTrailingZero: false,
                })}
                symbol='USDC'
              />
            }
          />
          <ClaimButton onClick={claimRewards} disabled={!isFeesClaimable}>
            {t('general.claim')}
          </ClaimButton>
        </Grid>
        <Grid item xs={6}>
          <ColoredBox sx={{ p: 0 }}>
            <InfoColumn
              title='KSU Rewards Claimable Balance'
              toolTipInfo='info'
              showDivider
              metric={
                <TokenAmount
                  py='6px'
                  px={2}
                  amount={totalKsuBonusAndRewards}
                  symbol='KSU'
                  usdValue={formatAmount(formatEther(rewardsInUSD))}
                />
              }
            />
          </ColoredBox>
          <ClaimButton onClick={undefined} disabled>
            {t('general.claim')}
          </ClaimButton>
        </Grid>
      </Grid>
    </CardWidget>
  )
}

export default RewardSummary
