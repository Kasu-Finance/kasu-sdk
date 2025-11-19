import { Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customPalette } from '@/themes/palette'

const LiteTrancheGrossApyTooltip = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='inherit'>
        Annual Percentage Yield (APY) shown is Gross, before Kasu protocol fees,
        which comprise 10% of interest earned. For example, if Gross APY is 15%,
        Net APY to Lenders is 13.5%.
      </Typography>
      <Typography variant='inherit'>
        Interest auto-compounds each epoch (7 days). The stated APY therefore
        assumes loan funds are deployed for a year.
      </Typography>
      <Typography variant='inherit'>
        The stated APY assumes no loan defaults.
      </Typography>
      <Typography variant='inherit'>
        See{' '}
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
          {t('general.userDocs')}
        </Button>{' '}
        for full details and calculations.
      </Typography>
    </Stack>
  )
}

export default LiteTrancheGrossApyTooltip
