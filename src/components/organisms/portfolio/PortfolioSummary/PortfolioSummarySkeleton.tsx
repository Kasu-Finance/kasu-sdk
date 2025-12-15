import { Grid2, Skeleton } from '@mui/material'

const PortfolioSummarySkeleton = () => {
  return (
    <Grid2 container spacing={4} mb={5}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid2 key={index} size={4}>
          <Skeleton variant='rounded' height={116} />
        </Grid2>
      ))}
    </Grid2>
  )
}

export default PortfolioSummarySkeleton
