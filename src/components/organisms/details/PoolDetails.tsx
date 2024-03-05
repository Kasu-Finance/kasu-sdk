import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'

import PoolDelegateCard from '@/components/molecules/details/PoolDelegateCard'
import PoolDetailsCard from '@/components/molecules/details/PoolDetailsCard'
import PoolTractionCard from '@/components/molecules/details/PoolTractionCard'
import RiskManagementCard from '@/components/molecules/details/RiskManagementCard'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'

const PoodDetails: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box>
      {loading ? (
        <>
          <CardSkeleton leftRowNumbers={3} rightRowNumbers={3} />
          <CardSkeleton leftRowNumbers={1} rightRowNumbers={4} />
          <CardSkeleton leftRowNumbers={2} rightRowNumbers={2} />
          <CardSkeleton leftRowNumbers={6} rightRowNumbers={3} />
        </>
      ) : (
        <>
          <PoolDelegateCard />
          <PoolDetailsCard />
          <PoolTractionCard />
          <RiskManagementCard />
        </>
      )}
    </Box>
  )
}

export default PoodDetails
