import { Box, Pagination, Stack } from '@mui/material'

import usePagination from '@/hooks/usePagination'

import PoolCard from '@/components/organisms/home/PoolCard'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolCardContainerProps = {
  pools: PoolOverviewWithDelegate[]
}

const CARDS_PER_PAGE = 3

const PoolCardContainer: React.FC<PoolCardContainerProps> = ({ pools }) => {
  const { currentPage, setPage, paginateData } = usePagination(
    CARDS_PER_PAGE,
    pools.length
  )

  return (
    <Stack spacing={4} alignItems='center'>
      <Box display='flex' flexWrap='wrap' gap={3} width='100%'>
        {paginateData([...pools]).map((pool) => (
          <PoolCard pool={pool} key={pool.id} />
        ))}
      </Box>
      {CARDS_PER_PAGE > pools.length && (
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
