'use client'

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Box, Grid, IconButton } from '@mui/material'
import { Children, ReactElement, useState } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import Pagination from '@/components/molecules/Pagination'

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

  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const handleBack = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  const currentChildren = childrenArray.slice(
    currentPage * slidesPerPage,
    (currentPage + 1) * slidesPerPage
  )

  const showIconBtn =
    childrenArray.length > 3 || (isMobile && childrenArray.length > 1)

  const gridSize = (totalChildren: number) => {
    if (totalChildren <= 2) {
      // 50% width for 2 elements
      return 6
    } else {
      // 33.33% width for more than 2 elements
      return 4
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', mt: 3 }}>
      {showIconBtn && (
        <IconButton
          onClick={handleBack}
          sx={{
            display: isMobile ? 'none' : 'block',
            position: 'absolute',
            top: '50%',
            color: 'white',
            transform: 'translateY(-50%)',
            zIndex: 1,
            ...arrowButtonStyle.leftArrow,
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>
      )}

      <Grid container spacing={3} justifyContent='center'>
        {currentChildren.map((child, index) => (
          <Grid item key={index} xs={12} md={gridSize(childrenArray.length)}>
            {child}
          </Grid>
        ))}
      </Grid>

      {showIconBtn && (
        <IconButton
          onClick={handleNext}
          sx={{
            display: isMobile ? 'none' : 'block',
            position: 'absolute',
            top: '50%',
            color: 'white',
            transform: 'translateY(-50%)',
            zIndex: 1,
            ...arrowButtonStyle.rightArrow,
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageClick={handlePageClick}
      />
    </Box>
  )
}

export default Carousel
