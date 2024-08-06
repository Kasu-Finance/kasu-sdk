import { Box, IconButton } from '@mui/material'

import { CardIcon, TableIcon } from '@/assets/icons'

const DisplayOptions = () => {
  return (
    <Box display='flex' alignItems='center'>
      <Box mr={1}>1-3 of 10</Box>
      <Box>
        <IconButton>
          <CardIcon />
        </IconButton>
        <IconButton>
          <TableIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
export default DisplayOptions
