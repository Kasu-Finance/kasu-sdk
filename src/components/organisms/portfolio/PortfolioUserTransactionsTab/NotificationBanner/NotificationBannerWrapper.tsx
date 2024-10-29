import { Suspense } from 'react'

import NotificationBanner from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/NotificationBanner'

import { getPoolOverview } from '@/app/_requests/pools'

const NotificationBannerWrapper = async () => {
  const pools = await getPoolOverview()

  return (
    <Suspense fallback={null}>
      <NotificationBanner pools={pools} />
    </Suspense>
  )
}

export default NotificationBannerWrapper
