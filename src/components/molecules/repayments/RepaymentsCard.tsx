import { Box, Button, Card, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import { DownloadIcon } from '@/assets/icons'

const metrics = [
  {
    id: 'closingCash',
    content: '100',
    unit: 'USDT',
  },
  {
    id: 'totalLoans',
    content: '100',
    unit: 'USDT',
  },
  {
    id: 'totalBalance',
    content: '100',
    unit: 'USDT',
  },
]

const RepaymentsCard: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Box display='flex' justifyContent='space-between'>
        <Typography variant='h6' mb={2}>
          {t('repayments.title')}
        </Typography>

        <Button
          type='button'
          variant='contained'
          sx={{ fontSize: 15 }}
          startIcon={<DownloadIcon color='white' opacity='1' />}
          onClick={() => alert('Download is not implemented yet.')}
        >
          {t('repayments.downloadBtn')}
        </Button>
      </Box>

      <Box mt={2}>
        <Typography variant='body2'>
          {t('repayments.loanModelDescription')}
        </Typography>
        <Typography variant='body2' mt={2}>
          {t('repayments.borrowerFundsCSV')}
        </Typography>
      </Box>

      <Box mt={2}>
        <Typography variant='h6'>
          {t('repayments.sections.aggregated.title')}
        </Typography>

        <Typography variant='body2' mt={2}>
          {t('repayments.sections.aggregated.description')}
        </Typography>

        <Box
          display='flex'
          width='100%'
          className='light-blue-background'
          mt={2}
        >
          metrics
        </Box>

        {/* {metrics.map((metric, index) => {
          const uniqueKey = `repayments-${metric.id}-${index}`
          const titleKey = `repayments.metrics.${metric.id}.label`
          const tooltipKey = `repayments.metrics.${metric.id}.tooltip`

          return (
            <MetricWithSuffix
              key={uniqueKey}
              titleKey={titleKey}
              tooltipKey={tooltipKey}
              suffix={metric?.unit || ''}
              content={String(metric.content)}
              containerSx={{ width: '33%', pb: 1, pr: 1 }}
            />
          )
        })} */}
      </Box>
    </Card>
  )
}

export default RepaymentsCard
