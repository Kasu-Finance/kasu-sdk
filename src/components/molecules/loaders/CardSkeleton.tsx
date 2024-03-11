import { Box, Card, Skeleton } from '@mui/material'
import React from 'react'

interface CardSkeletonProps {
  leftRowNumbers: number
  rightRowNumbers: number
}

interface SkeletonRowsProps {
  count: number
  [key: string]: any
}

const SkeletonRows: React.FC<SkeletonRowsProps> = ({ count, ...props }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton
        key={index}
        variant='rectangular'
        height={35}
        sx={{ mb: 1 }}
        {...props}
      />
    ))}
  </>
)

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  leftRowNumbers,
  rightRowNumbers,
}) => {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mb: 2 }} elevation={1}>
      <Skeleton variant='text' width='40%' height={50} />
      <Box display='flex'>
        <Box width='50%'>
          <SkeletonRows count={leftRowNumbers} />
        </Box>
        <Box width='50%'>
          <SkeletonRows count={rightRowNumbers} />
        </Box>
      </Box>
    </Card>
  )
}

export default CardSkeleton
