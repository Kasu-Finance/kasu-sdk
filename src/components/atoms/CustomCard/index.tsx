'use client'

import { Card, styled } from '@mui/material'

import { theme } from '@/themes/MainTheme'

const CustomCard = styled(Card)({
  flex: 1,
  backgroundColor: theme.palette.gray.extraDark,
  overflow: 'unset',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 25, // to prevent extra pixels from rendering
  borderBottomRightRadius: 25, // to prevent extra pixels from rendering
  boxShadow: '0px 5px 20px 0px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
})

export default CustomCard
