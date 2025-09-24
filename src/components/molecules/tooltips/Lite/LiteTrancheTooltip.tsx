import { Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import { customPalette } from '@/themes/palette'

const LiteTrancheTooltip = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='inherit'>
        In the event of losses, Senior Tranche Lenders have the first claim on
        any recovered funds, followed by Mezzanine (if applicable), and finally
        Junior Tranche Lenders. APY levels reflect this order of risk.
      </Typography>
      <Typography variant='inherit'>
        This priority ranking is subject to a Subordination and Priority Deed.
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
        for full details.
      </Typography>
    </Stack>
  )
}

export default LiteTrancheTooltip
