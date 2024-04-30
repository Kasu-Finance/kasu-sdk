'use client'

import { Grid } from '@mui/material'
import { formatEther, formatUnits } from 'ethers/lib/utils'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import ClaimButton from '@/components/molecules/locking/RewardSummary/ClaimButton'

import { TOKENS } from '@/constants/tokens'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const RewardSummary = () => {
  const { lockingRewards } = useLockingRewards()
  const { t } = useTranslation()
  const claimRewards = useClaimLockingRewards()

  const { userLocks } = useUserLocks()
  const { ksuPrice } = useKsuPrice()

  if (!userLocks?.length) {
    return null
  }

  // TODO: remove index, it should be object not array
  const ksuBonus = formatUnits(
    toBigNumber(userLocks[0]?.ksuBonusAndRewards || '0'),
    TOKENS.KSU.decimals
  )

  const rewardsInUSD = convertToUSD(
    toBigNumber(ksuBonus || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const isFeesClaimable = Boolean(
    lockingRewards && !toBigNumber(lockingRewards.claimableRewards).isZero()
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
                amount={formatAmount(lockingRewards?.claimableRewards ?? '0', {
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
                  amount={formatAmount(ksuBonus)}
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
