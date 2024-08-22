import HomeOverview from '@/components/molecules/home/HomeOverview'

import { getPoolOverview } from '@/app/requests/pools'
import { getPoolsTotals } from '@/app/requests/poolTotals'

const Home = async () => {
  const pools = await getPoolOverview()

  const lendingTotals = await getPoolsTotals(pools)

  return <HomeOverview lendingTotals={lendingTotals} />
}

export default Home
