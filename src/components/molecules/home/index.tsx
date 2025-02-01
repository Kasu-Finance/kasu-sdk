import HomeOverview from '@/components/molecules/home/HomeOverview'

import { getPlatformOverview } from '@/app/_requests/platformOverview'
import { getPoolOverview } from '@/app/_requests/pools'
import { getPoolsTotals } from '@/app/_requests/poolTotals'

const Home = async () => {
  const pools = await getPoolOverview()

  const [platformOverview, lendingTotals] = await Promise.all([
    getPlatformOverview(),
    getPoolsTotals(pools),
  ])

  return (
    <HomeOverview
      lendingTotals={lendingTotals}
      platformOverview={platformOverview}
    />
  )
}

export default Home
