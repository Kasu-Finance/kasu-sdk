'use client'

import PoolTableRow from '@/components/organisms/home/PoolTable/PoolTableRow'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolTableBodyProps = {
  pools: PoolOverviewWithDelegate[]
}

const PoolTableBody: React.FC<PoolTableBodyProps> = ({ pools }) => {
  return pools.map((pool) => <PoolTableRow pool={pool} key={pool.id} />)
}

export default PoolTableBody
