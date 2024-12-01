import HomeOverview from '@/components/molecules/home/HomeOverview'

import { getPoolOverview } from '@/app/_requests/pools'
import { getPoolsTotals } from '@/app/_requests/poolTotals'

const Home = async () => {
  const pools = await getPoolOverview()

  const lendingTotals = await getPoolsTotals(pools)

  return <HomeOverview lendingTotals={lendingTotals} />
}

export default Home
