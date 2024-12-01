'use client'

import { Box, IconButton } from '@mui/material'

import useHomeState from '@/hooks/context/useHomeState'

import { LayoutTypes } from '@/context/home/home.types'

import { CardIcon, TableIcon } from '@/assets/icons'

const DisplayOptions = () => {
  const { layout, setLayout } = useHomeState()

  return (
    <Box display='flex' alignItems='center'>
      <Box mr={1}>1-3 of 10</Box>
      <Box>
        <IconButton
          sx={(theme) => ({
            'svg rect': {
              fill:
                layout === LayoutTypes.CARD
                  ? theme.palette.gold.dark
                  : theme.palette.gray.light,
            },
          })}
          onClick={() => setLayout(LayoutTypes.CARD)}
        >
          <CardIcon />
        </IconButton>
        <IconButton
          sx={(theme) => ({
            'svg rect': {
              fill:
                layout === LayoutTypes.TABLE
                  ? theme.palette.gold.dark
                  : theme.palette.gray.light,
            },
          })}
          onClick={() => setLayout(LayoutTypes.TABLE)}
        >
          <TableIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
export default DisplayOptions
