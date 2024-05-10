import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  Link,
  Typography,
} from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import LendingLoyalityInfo from '@/components/molecules/locking/LoyaltyOverview/LendingLoyalityInfo'

import { LockIcon, WalletIcon } from '@/assets/icons'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LoyaltyCard: React.FC<{
  poolId: string
}> = ({ poolId }) => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpenLockingKSU = () => openModal({ name: 'lockModal' })
  const { userLocks } = useUserLocks()
  const { ksuPrice } = useKsuPrice()
  const { userBonus } = useUserBonusData()
  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const { lendingPortfolioData } = useLendingPortfolioData()

  const lifetimeBonusYieldEarnings: string = lendingPortfolioData
    ? lendingPortfolioData.lendingPools.find((pool) => pool.id === poolId)
        ?.totalYieldEarningsLifetime || '0.00'
    : '0.00'

  const totalKsuBonusAndRewards = useMemo(() => {
    if (!userBonus) {
      return '0.00'
    }

    return formatAmount(userBonus?.protocolFeesEarned)
  }, [userBonus])

  const userKSU = userLocks && userLocks.length > 0 ? userLocks[0] : null

  const totalBonusYieldUSDC = userKSU
    ? formatEther(
        convertToUSD(
          toBigNumber(totalKsuBonusAndRewards),
          toBigNumber(ksuPrice || '0')
        )
      )
    : '0'

  const lifetimeYieldEarnedUSDC = userKSU
    ? formatEther(
        convertToUSD(
          toBigNumber(totalKsuBonusAndRewards),
          toBigNumber(ksuPrice || '0')
        )
      )
    : '0'

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={t('lending.poolOverview.lockingStatus.title')}
        titleTypographyProps={{
          variant: 'h6',
          component: 'h6',
          m: 0,
        }}
      />

      <Grid
        container
        direction='row'
        justifyContent='flex-start'
        alignItems='stretch'
        columnSpacing={3}
        sx={{ p: 2, pb: 0 }}
      >
        <Grid item xs={6}>
          <LendingLoyalityInfo />
        </Grid>
        <Grid item xs={6}>
          <InfoRow
            title={t('lending.poolOverview.lockingStatus.lockedInfo.label')}
            sx={{ pl: 0 }}
            toolTipInfo={t(
              'lending.poolOverview.lockingStatus.lockedInfo.tooltip'
            )}
          />
          <Divider />
          <ContentWithSuffix
            content={formatAmount(userKSU?.lockedAmount)}
            suffix='KSU'
            sx={{ pl: 0 }}
          />
          <Typography mt={2} variant='subtitle1'>
            {t('lending.poolOverview.lockingStatus.lendingAndBonus.label')}
          </Typography>
          <Typography variant='caption'>
            {t('lending.poolOverview.lockingStatus.lendingAndBonus.caption')}
          </Typography>
          <ColoredBox sx={{ mt: 2, mb: 2 }}>
            <InfoRow
              title={t('lending.poolOverview.lockingStatus.apyBonus.label')}
              toolTipInfo={t(
                'lending.poolOverview.lockingStatus.apyBonus.tooltip'
              )}
              showDivider
              metric={
                <ContentWithSuffix
                  content={
                    currentLevel === 1
                      ? '0.1%'
                      : currentLevel === 2
                        ? '0.2%'
                        : 'None'
                  }
                />
              }
            />
            <InfoRow
              title={t(
                'lending.poolOverview.lockingStatus.totalBonusYield.label'
              )}
              toolTipInfo={t(
                'lending.poolOverview.lockingStatus.totalBonusYield.tooltip'
              )}
              showDivider
              metric={
                <div>
                  <ContentWithSuffix
                    textAlign='right'
                    content={`${formatAmount(totalKsuBonusAndRewards)}`}
                    suffix='KSU test'
                  />
                  <Typography
                    textAlign='right'
                    sx={{ fontSize: '12px' }}
                    variant='caption'
                    component='h6'
                  >
                    {formatAmount(totalBonusYieldUSDC)} USDC
                  </Typography>
                </div>
              }
            />
            <InfoRow
              title={t(
                'lending.poolOverview.lockingStatus.lifeTimeBonus.label'
              )}
              toolTipInfo={t(
                'lending.poolOverview.lockingStatus.lifeTimeBonus.tooltip'
              )}
              showDivider
              metric={
                <div>
                  <ContentWithSuffix
                    textAlign='right'
                    content={`${formatAmount(lifetimeBonusYieldEarnings)}`}
                    suffix='KSU TEST'
                  />
                  <Typography
                    textAlign='right'
                    sx={{ fontSize: '12px' }}
                    variant='caption'
                    component='h6'
                  >
                    {formatAmount(lifetimeYieldEarnedUSDC)}
                    USDC
                  </Typography>
                </div>
              }
            />
            <Box sx={{ pl: 2, py: 1 }}>
              <Link
                display='inline-block'
                textTransform='none'
                sx={{
                  textDecoration: 'none',
                }}
                href='/'
              >
                {t('lending.poolOverview.lockingStatus.allOtherRewards.label')}
              </Link>
              <ToolTip
                sx={{ display: 'inline-block' }}
                title={t(
                  'lending.poolOverview.lockingStatus.allOtherRewards.tooltip'
                )}
              />
            </Box>
          </ColoredBox>
        </Grid>
      </Grid>
      <Grid
        container
        direction='row'
        justifyContent='flex-start'
        alignItems='stretch'
        columnSpacing={3}
        sx={{ pb: 2, pt: 0 }}
      >
        <Grid item xs={6}>
          <Box display='flex' justifyContent='end' width='100%'>
            <Button
              onClick={handleOpenLockingKSU}
              variant='contained'
              startIcon={<LockIcon />}
            >
              {t('general.lockKSU')}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant='contained'
            href='https://www.google.com'
            target='_blank'
            startIcon={<WalletIcon />}
          >
            {t('general.buyKSU')}
          </Button>
        </Grid>
      </Grid>
    </Card>
  )
}

export default LoyaltyCard
