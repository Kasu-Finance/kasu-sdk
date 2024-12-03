'use client'

import { Box, IconButton } from '@mui/material'

import useHomeState from '@/hooks/context/useHomeState'

import { CARDS_PER_PAGE } from '@/components/organisms/home/PoolCard/PoolCardContainer'
import { ROW_PER_PAGE } from '@/components/organisms/home/PoolTable'

import { LayoutTypes } from '@/context/home/home.types'

import { CardIcon, TableIcon } from '@/assets/icons'

const DisplayOptions = () => {
  const { layout, totalPoolCount, currentPage, setLayout } = useHomeState()

  const ITEMS_PER_PAGE =
    layout === LayoutTypes.CARD ? CARDS_PER_PAGE : ROW_PER_PAGE

  const displayedItems = `${Math.max(currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE, 1)}-${Math.min(currentPage * ITEMS_PER_PAGE, totalPoolCount)}`

  return (
    <Box display='flex' alignItems='center'>
      <Box mr={1}>
        {totalPoolCount ? displayedItems : '0'} of {totalPoolCount}
      </Box>
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
