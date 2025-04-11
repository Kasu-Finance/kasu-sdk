import HomeOverview from '@/components/molecules/home/HomeOverview'

import { getPlatformOverview } from '@/app/_requests/platformOverview'
import { getPoolsTotals } from '@/app/_requests/poolTotals'

export const dynamic = 'force-dynamic'

const Home = async () => {
  const [platformOverview, lendingTotals] = await Promise.all([
    getPlatformOverview(),
    getPoolsTotals(),
  ])

  return (
    <HomeOverview
      lendingTotals={lendingTotals}
      platformOverview={platformOverview}
    />
  )
}

export default Home
