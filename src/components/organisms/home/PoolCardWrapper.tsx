import PoolCard from '@/components/molecules/PoolCard'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardWrapperProps = {
  pools: PoolOverviewWithDelegate[]
}

const PoolCardWrapper: React.FC<PoolCardWrapperProps> = ({ pools }) => {
  return pools.map((pool) => <PoolCard pool={pool} key={pool.id} />)
}

export default PoolCardWrapper
