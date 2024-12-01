import { Box, styled } from '@mui/material'

const TabsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 4,
    background: '#C4996C',
    borderRadius: 4,
  },
})

export default TabsContainer
