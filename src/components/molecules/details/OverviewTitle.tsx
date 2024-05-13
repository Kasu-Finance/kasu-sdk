'use client'

import PhotoIcon from '@mui/icons-material/Photo'
import { Button, CardHeader } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

interface OverviewTitleProps {
  pdfUrl?: string
}

const OverviewTitle: React.FC<OverviewTitleProps> = ({ pdfUrl }) => {
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
          sx={{ top: 4, right: 8 }}
          size='small'
          startIcon={<PhotoIcon />}
          onClick={() => window.open(pdfUrl || '', '_blank')}
        >
          {t('lending.strategyDeck')}
        </Button>
      }
    />
  )
}

export default OverviewTitle
