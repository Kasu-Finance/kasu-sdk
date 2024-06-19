import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import LockClockIcon from '@mui/icons-material/LockClock'
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import ColoredBox from '@/components/atoms/ColoredBox'
import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
import InfoRow from '@/components/atoms/InfoRow'
import NextLink from '@/components/atoms/NextLink'
import LendingLoyalityInfo from '@/components/molecules/locking/LoyaltyOverview/LendingLoyalityInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LoyaltyCard: React.FC<{
  poolId: string
}> = ({ poolId }) => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpenLockingKSU = () => openModal({ name: ModalsKeys.LOCK })
  const { userLocks } = useUserLocks()
  const { ksuPrice } = useKsuPrice()
  const { userBonus } = useUserBonusData()
  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const { lendingPortfolioData } = useLendingPortfolioData()

  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const lifetimeBonusYieldEarnings =
    (
      lendingPortfolioData &&
      lendingPortfolioData?.lendingPools.find((pool) => pool.id === poolId)
    )?.totalYieldEarningsLifetime ?? '0.00'

  const totalKsuBonusAndRewards = useMemo(() => {
    if (!userBonus) {
      return '0.00'
    }

    return formatAmount(userBonus?.protocolFeesEarned || '0')
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
    <Card>
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
        direction={isMobile ? 'column' : 'row'}
        justifyContent='flex-start'
        alignItems='stretch'
        columnSpacing={3}
        sx={{ p: 2, pb: 0 }}
      >
        <Grid item xs={6}>
          <LendingLoyalityInfo />
        </Grid>
        <Grid item xs={6} mt={isMobile ? 2 : 0}>
          <InfoRow
            title={t('lending.poolOverview.lockingStatus.lockedInfo.label')}
            sx={{ pl: 0 }}
            toolTipInfo={t(
              'lending.poolOverview.lockingStatus.lockedInfo.tooltip'
            )}
          />
          <Divider />
          <ContentWithSuffix
            content={formatAmount(userKSU?.lockedAmount || '0')}
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
                        : '0.00 %'
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
                    content={`${formatAmount(totalKsuBonusAndRewards || '0')}`}
                    suffix='KSU'
                  />
                  <Typography
                    textAlign='right'
                    sx={{ fontSize: '12px' }}
                    variant='caption'
                    component='h6'
                  >
                    {formatAmount(totalBonusYieldUSDC || '0')} USDC
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
                    content={`${formatAmount(lifetimeBonusYieldEarnings || '0')}`}
                    suffix='KSU'
                  />
                  <Typography
                    textAlign='right'
                    sx={{ fontSize: '12px' }}
                    variant='caption'
                    component='h6'
                  >
                    {formatAmount(lifetimeYieldEarnedUSDC || '0')}
                    USDC
                  </Typography>
                </div>
              }
            />
            <Box sx={{ display: 'flex', pl: 2, py: 1 }}>
              <NextLink
                display='inline-block'
                textTransform='none'
                sx={{
                  textDecoration: 'none',
                }}
                href={Routes.locking.root.url}
                prefetch
              >
                <Typography variant='caption' component='span'>
                  {t(
                    'lending.poolOverview.lockingStatus.allOtherRewards.label'
                  )}
                </Typography>
              </NextLink>
              {/* <ToolTip
                title={t(
                  'lending.poolOverview.lockingStatus.allOtherRewards.tooltip'
                )}
              /> */}
            </Box>
          </ColoredBox>
        </Grid>
      </Grid>

      {!isMobile && (
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
                startIcon={<LockClockIcon />}
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
              startIcon={<AccountBalanceWalletIcon />}
            >
              {t('general.buyKSU')}
            </Button>
          </Grid>
        </Grid>
      )}
    </Card>
  )
}

export default LoyaltyCard
