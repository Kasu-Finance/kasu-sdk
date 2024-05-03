'use client'

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Box, Grid, IconButton } from '@mui/material'
import { Children, ReactElement, useState } from 'react'

// Extend CarouselProps to accept a generic type for children
interface CarouselProps<T> {
  children: ReactElement<T>[] | ReactElement<T>
  slidesPerPage: number
  arrowButtonStyle?: {
    leftArrow?: React.CSSProperties
    rightArrow?: React.CSSProperties
  }
}

const Carousel = <T,>({
  children,
  slidesPerPage = 3,
  arrowButtonStyle = {},
}: CarouselProps<T>) => {
  const [currentPage, setCurrentPage] = useState(0)
  const childrenArray = Children.toArray(children) as ReactElement<T>[]
  const totalPages = Math.ceil(childrenArray.length / slidesPerPage)

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const handleBack = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const currentChildren = childrenArray.slice(
    currentPage * slidesPerPage,
    (currentPage + 1) * slidesPerPage
  )

  const showIconBtn = childrenArray.length > 3

  return (
    <Box sx={{ position: 'relative', width: '100%', mt: 4 }}>
      {showIconBtn && (
        <IconButton
          onClick={handleBack}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            ...arrowButtonStyle.leftArrow,
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>
      )}

      <Grid container spacing={2} justifyContent='center'>
        {currentChildren.map((child, index) => (
          <Grid item key={index} xs={12 / slidesPerPage}>
            {child}
          </Grid>
        ))}
      </Grid>
      {showIconBtn && (
        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            ...arrowButtonStyle.rightArrow,
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}
    </Box>
  )
}

export default Carousel
