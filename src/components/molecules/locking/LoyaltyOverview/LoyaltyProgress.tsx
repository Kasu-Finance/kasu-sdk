import { Box, Typography } from '@mui/material'
import React from 'react'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'

import ProgressBar from '@/components/atoms/ProgressBar'

import { ChevronDownIcon } from '@/assets/icons'

const GRID_TEMPLATE_COLUMN =
  'minmax(0, 0.45fr) minmax(0, 0.25fr) minmax(0, 0.3fr)'

const LEVEL_1_WIDTH = 70 // should corresponds to grid template column above
const LEVEL_2_WIDTH = 100 - LEVEL_1_WIDTH

const calculateValue = (
  stakedPercentage: number,
  level_1: number,
  level_2: number
) => {
  switch (true) {
    case stakedPercentage <= level_1:
      return (stakedPercentage / level_1) * LEVEL_1_WIDTH
    case stakedPercentage < level_2:
      return (
        LEVEL_1_WIDTH +
        ((stakedPercentage - level_1) / (level_2 - level_1)) * LEVEL_2_WIDTH
      )
    default:
      return LEVEL_1_WIDTH + LEVEL_2_WIDTH
  }
}

type LoyaltyProgressProps = {
  stakedPercentage: number
}

const LoyaltyProgress: React.FC<LoyaltyProgressProps> = ({
  stakedPercentage,
}) => {
  const { level_1, level_2, getCurrentLevel } = useLoyaltyLevel()

  return (
    <Box mt={1}>
      <Box
        display='grid'
        alignItems='center'
        gridTemplateColumns={GRID_TEMPLATE_COLUMN}
        mb='6px'
      >
        <Box
          display='flex'
          alignItems='center'
          gap='7px'
          sx={(theme) =>
            stakedPercentage !== 0
              ? {
                  '& svg > path': {
                    fill: theme.palette.primary.main,
                    fillOpacity: 1,
                  },
                  color: theme.palette.text.primary,
                }
              : {
                  color: theme.palette.text.disabled,
                }
          }
        >
          <ChevronDownIcon />
          <Typography variant='subtitle2' component='span'>
            No Loyalty Status
          </Typography>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          gap='7px'
          justifyContent='end'
          mr='-5px' // half of chevron width to make sure arrow is pointing correctly
          sx={(theme) =>
            getCurrentLevel(stakedPercentage) !== undefined
              ? {
                  '& svg > path': {
                    fill: theme.palette.primary.main,
                    fillOpacity: 1,
                  },
                  color: theme.palette.text.primary,
                }
              : {
                  color: theme.palette.text.disabled,
                }
          }
        >
          <Typography variant='body2' component='span'>
            Loyalty
          </Typography>
          <Typography variant='subtitle2' component='span'>
            Level 1
          </Typography>
          <ChevronDownIcon />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          gap='7px'
          justifyContent='end'
          sx={(theme) =>
            getCurrentLevel(stakedPercentage) === 'LEVEL_2'
              ? {
                  '& svg > path': {
                    fill: theme.palette.primary.main,
                    fillOpacity: 1,
                  },
                  color: theme.palette.text.primary,
                }
              : {
                  color: theme.palette.text.disabled,
                }
          }
        >
          <Typography variant='body2' component='span'>
            Loyalty
          </Typography>
          <Typography variant='subtitle2' component='span'>
            Level 2
          </Typography>
          <ChevronDownIcon />
        </Box>
      </Box>
      <ProgressBar
        rootStyles={{ height: 24, borderRadius: '4px' }}
        barStyles={{
          display: 'grid',
          alignItems: 'center',
          gridTemplateColumns: GRID_TEMPLATE_COLUMN,
          padding: '0 4px',
        }}
        value={calculateValue(stakedPercentage, level_1, level_2)}
      >
        <Typography variant='caption' component='span'>
          0%
        </Typography>
        <Typography variant='caption' component='span' textAlign='right'>
          1%
        </Typography>
        <Typography variant='caption' component='span' textAlign='right'>
          5%
        </Typography>
      </ProgressBar>
    </Box>
  )
}

export default LoyaltyProgress
