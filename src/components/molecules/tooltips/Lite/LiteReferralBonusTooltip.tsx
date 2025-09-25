import { Button, Typography } from '@mui/material'

import { customPalette } from '@/themes/palette'

const LiteReferralBonusTooltip = () => {
  return (
    <Typography variant='inherit'>
      Refer a friend and you will both earn 5% each on top of their existing net
      interest earnings. See{' '}
      <Button
        variant='text'
        sx={{
          p: 0,
          height: 'auto',
          textTransform: 'unset',
          font: 'inherit',
          verticalAlign: 'inherit',
          display: 'inline',
          color: 'white',
        }}
        href='https://docs.kasu.finance/'
        target='_blank'
        style={{ font: 'inherit', color: customPalette.gold.dark }}
      >
        Terms & Conditions
      </Button>{' '}
      for full detail.
    </Typography>
  )
}

export default LiteReferralBonusTooltip
