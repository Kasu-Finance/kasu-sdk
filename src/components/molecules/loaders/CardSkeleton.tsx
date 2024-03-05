import { Box, Card, Skeleton } from '@mui/material'
import React from 'react'

interface CardSkeletonProps {
  leftRowNumbers: number
  rightRowNumbers: number
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  leftRowNumbers,
  rightRowNumbers,
}) => {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mb: 2 }} elevation={1}>
      <Skeleton variant='text' width='40%' height={50} />
      <Box display='flex'>
        <Box width='50%'>
          {[...Array(leftRowNumbers)].map((_, index) => (
            <Skeleton
              key={`left-${index}`}
              variant='rectangular'
              height={35}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
        <Box width='50%'>
          {[...Array(rightRowNumbers)].map((_, index) => (
            <Skeleton
              key={`right-${index}`}
              variant='rectangular'
              height={35}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Box>
    </Card>
  )
}

export default CardSkeleton
