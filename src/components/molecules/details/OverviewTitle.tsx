'use client'

import PhotoIcon from '@mui/icons-material/Photo'
import { Button, CardHeader } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const OverviewTitle = () => {
  const { t } = useTranslation()

  return (
    <CardHeader
      title={t('lending.poolOverview.title')}
      titleTypographyProps={{
        variant: 'h6',
        component: 'h6',
        m: 0,
      }}
      action={
        <Button
          variant='contained'
          sx={{ height: '30px', top: 4, pl: 1.25, pr: 1.25, right: 8 }}
          size='small'
          startIcon={<PhotoIcon />}
        >
          {t('lending.strategyDeck')}
        </Button>
      }
    />
  )
}

export default OverviewTitle
