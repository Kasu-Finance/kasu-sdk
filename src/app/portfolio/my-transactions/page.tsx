import { Stack } from '@mui/material'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import LiteModeRenderer from '@/components/atoms/LiteModeRenderer'
import WaveBox from '@/components/atoms/WaveBox'
import NextClearingPeriodInfo from '@/components/molecules/NextClearingPeriodInfo'
import DetailedLendingRequestTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions'
import DetailedWithdrawalRequestTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions'
import LendingStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary'
import NotificationBannerWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/NotificationBanner/NotificationBannerWrapper'
import WithdrawalStatusSummary from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/WithdrawalStatusSummary'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { Routes } from '@/config/routes'

const YourTransactions = async () => {
  const currentEpoch = await getCurrentEpoch()

  const { t } = getTranslation()

  return (
    <LiteModeRenderer
      renderOnLiteMode={redirect(Routes.portfolio.root.url)}
      otherwise={
        <Stack spacing={3}>
          <NotificationBannerWrapper />
          <WaveBox variant='gray' borderRadius={2}>
            <NextClearingPeriodInfo
              beforeText={t('portfolio.transactions.dataUpdateTime')}
              sx={{
                bgcolor: 'unset',
              }}
              typographyProps={{
                variant: 'baseSm',
              }}
              timeTypographyProps={{
                variant: 'baseSm',
                display: 'inline-block',
              }}
              skeletonProps={{
                sx: {
                  bgcolor: 'rgba(40, 40, 42, 0.11)',
                },
              }}
            />
          </WaveBox>
          <Suspense fallback={null}>
            <LendingStatusSummary />
            <WithdrawalStatusSummary currentEpoch={currentEpoch} />
          </Suspense>
          <DetailedLendingRequestTransactions currentEpoch={currentEpoch} />
          <DetailedWithdrawalRequestTransactions currentEpoch={currentEpoch} />
        </Stack>
      }
    />
  )
}

export default YourTransactions
