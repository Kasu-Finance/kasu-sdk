import HomeOverview from '@/components/molecules/home/HomeOverview'

import { getPoolsTotals } from '@/app/api/lendingTotal/route'
import { getPoolOverview } from '@/app/api/pools/route'

const Home = async () => {
  const pools = await getPoolOverview()

  const lendingTotals = await getPoolsTotals(pools)

  return <HomeOverview lendingTotals={lendingTotals} />
}

export default Home
