import { Box, LinearProgress, Typography } from '@mui/material'

import { ChevronDownIcon } from '@/assets/icons'

const LoyaltyProgress = () => {
  return (
    <Box
      mt={1}
      display='grid'
      alignItems='center'
      gridTemplateColumns='minmax(0, 0.70fr) max-content minmax(0, 0.3fr)'
      rowGap='6px'
    >
      <Box display='contents'>
        <Box display='flex' alignItems='center' gap='7px'>
          <ChevronDownIcon />
          <Typography
            variant='subtitle2'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            Regular
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap='7px' justifyContent='end'>
          <ChevronDownIcon />
          <Typography
            variant='subtitle2'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            Level 1
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap='7px' justifyContent='end'>
          <Typography
            variant='subtitle2'
            component='span'
            color={(theme) => theme.palette.text.disabled}
          >
            Level 2
          </Typography>
          <ChevronDownIcon />
        </Box>
      </Box>
      <Box display='contents'>
        <LinearProgress
          sx={{
            height: 24,
            borderRadius: 1,

            gridColumn: '1/4',
            gridRow: '2/3',
          }}
          variant='determinate'
          value={50}
        />
        <Typography
          variant='caption'
          component='span'
          pl={0.5}
          gridRow='2/3'
          gridColumn='1/2'
          zIndex={10}
          color='white'
          sx={{ mixBlendMode: 'difference' }}
        >
          0%
        </Typography>
        <Typography
          variant='caption'
          component='span'
          gridRow='2/3'
          gridColumn='2/3'
          zIndex={10}
        >
          1%
        </Typography>
        <Typography
          variant='caption'
          component='span'
          textAlign='right'
          pr={0.5}
          gridRow='2/3'
          gridColumn='3/4'
          zIndex={10}
        >
          5%
        </Typography>
      </Box>
    </Box>
  )
}

export default LoyaltyProgress
