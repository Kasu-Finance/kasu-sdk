'use client'
import { Box, Grid, Pagination } from '@mui/material'
import { Children, ReactElement, useState } from 'react'

// Extend CarouselProps to accept a generic type for children
interface CarouselProps<T> {
  children: ReactElement<T>[] | ReactElement<T>
  slidesPerPage: number
}

const Carousel = <T,>({ children, slidesPerPage }: CarouselProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)

  const childrenArray = Children.toArray(children) as ReactElement<T>[]
  const COLS = 12

  const validSlidesPerPage = Math.min(Math.max(slidesPerPage, 1), 4)
  const pageCount = Math.ceil(childrenArray.length / validSlidesPerPage)
  const startIndex = (currentPage - 1) * validSlidesPerPage
  const endIndex = startIndex + validSlidesPerPage
  const currentChildren = childrenArray.slice(startIndex, endIndex)

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={2} justifyContent='center'>
        {currentChildren.map((child, index) => (
          <Grid item key={index} xs={COLS / validSlidesPerPage}>
            {child}
          </Grid>
        ))}
      </Grid>

      <Box display='flex' justifyContent='center' overflow='hidden'>
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color='primary'
          sx={{ mt: 4 }}
        />
      </Box>
    </Box>
  )
}

export default Carousel
