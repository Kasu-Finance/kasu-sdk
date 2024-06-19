import { Box, Pagination as MuiPagination } from '@mui/material'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageClick: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageClick,
}) => {
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageClick(page - 1)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 2,
      }}
    >
      <MuiPagination
        count={totalPages}
        page={currentPage + 1}
        onChange={handleChange}
        siblingCount={0}
        boundaryCount={1}
        color='primary'
        hidePrevButton={isMobile ? false : true}
        hideNextButton={isMobile ? false : true}
        sx={{
          '& .MuiPaginationItem-root': {
            bgcolor: 'white',
            color: 'primary.contrastText',
            boxShadow: '0 0 1px 1px black',

            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
          '& .Mui-selected': {
            bgcolor: 'primary.main',
          },
        }}
      />
    </Box>
  )
}

export default Pagination
