import { Box, SxProps, Theme, Typography } from '@mui/material'
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

const getLabelStyle =
  (enabled: boolean): SxProps<Theme> =>
  (theme) =>
    enabled
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
          sx={getLabelStyle(stakedPercentage !== 0)}
        >
          <ChevronDownIcon />
          <Typography variant='subtitle2' component='span' ml='7px'>
            No Loyalty Status
          </Typography>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='end'
          mr='-5px' // half of chevron width to make sure arrow is pointing correctly
          sx={getLabelStyle(
            getCurrentLevel(stakedPercentage) !== undefined &&
              getCurrentLevel(stakedPercentage) !== 'LEVEL_0'
          )}
        >
          <Typography variant='body2' component='span'>
            Loyalty&nbsp;
          </Typography>
          <Typography variant='subtitle2' component='span' mr='7px'>
            Level 1
          </Typography>
          <ChevronDownIcon />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='end'
          sx={getLabelStyle(getCurrentLevel(stakedPercentage) === 'LEVEL_2')}
        >
          <Typography variant='body2' component='span'>
            Loyalty&nbsp;
          </Typography>
          <Typography variant='subtitle2' component='span' mr='7px'>
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
