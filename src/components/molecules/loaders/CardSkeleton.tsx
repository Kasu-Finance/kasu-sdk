import { Theme } from '@emotion/react'
import { Box, Card, Skeleton, SxProps } from '@mui/material'
import React from 'react'

interface CardSkeletonProps {
  leftRowNumbers: number
  rightRowNumbers: number
  showSubtitle?: boolean
  titleStyle?: SxProps<Theme>
  subtitleStyle?: SxProps<Theme>
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
  showSubtitle = false,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <Card sx={{ minWidth: 275, boxShadow: 0, padding: 2 }} elevation={1}>
      <Box sx={titleStyle}>
        <Skeleton variant='text' width='100%' height={50} />
      </Box>
      {showSubtitle && (
        <Box mb={2} sx={subtitleStyle}>
          <Skeleton variant='text' width='100%' height={50} />
        </Box>
      )}
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
