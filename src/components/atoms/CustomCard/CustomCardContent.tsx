'use client'

import { CardContent, styled } from '@mui/material'

const CustomCardContent = styled(CardContent)({
  borderRadius: 8,
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  width: '100%',
  overflow: 'hidden',
  padding: 0,
  '&:last-child': {
    paddingBottom: 0,
  },
})

export default CustomCardContent
