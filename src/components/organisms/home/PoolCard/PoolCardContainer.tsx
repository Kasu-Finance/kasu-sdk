import { Box, Pagination, Stack } from '@mui/material'
import { useEffect } from 'react'

import useHomeState from '@/hooks/context/useHomeState'
import usePagination from '@/hooks/usePagination'

import PoolCard from '@/components/organisms/home/PoolCard'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardContainerProps = {
  pools: PoolOverviewWithDelegate[]
  currentEpoch: string
}

export const CARDS_PER_PAGE = 3

const PoolCardContainer: React.FC<PoolCardContainerProps> = ({
  pools,
  currentEpoch,
}) => {
  const { currentPage, setPage, paginateData } = usePagination(
    CARDS_PER_PAGE,
    pools.length
  )

  const { setCurrentPage } = useHomeState()

  useEffect(() => {
    setCurrentPage(currentPage)
  }, [currentPage, setCurrentPage])

  return (
    <Stack spacing={4} alignItems='center'>
      <Box display='flex' flexWrap='wrap' gap={3} width='100%'>
        {paginateData([...pools]).map((pool) => (
          <PoolCard pool={pool} currentEpoch={currentEpoch} key={pool.id} />
        ))}
      </Box>
      {pools.length > CARDS_PER_PAGE && (
        <Pagination
          color='primary'
          boundaryCount={2}
          siblingCount={0}
          count={Math.ceil(pools.length / CARDS_PER_PAGE)}
          page={currentPage}
          onChange={(_, page) => setPage(page)}
        />
      )}
    </Stack>
  )
}

export default PoolCardContainer
