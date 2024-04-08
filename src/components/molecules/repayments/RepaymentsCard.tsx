import { Box, Button, Card, Grid, Typography } from '@mui/material'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import InfoColumn from '@/components/atoms/InfoColumn'
import RenderMetrics from '@/components/molecules/repayments/RenderMetrics'

import { DownloadIcon } from '@/assets/icons'

import { extractDateAndUtcOffset, formatTimestampWithOffset } from '@/utils'

const fundsFlowReport = {
  cumulativeFunds: {
    title: 'Cumulative Lending Funds Flow',
    titleSuffix: '(Actual)',
    metrics: [
      { id: 'closingLoans', content: '100', unit: 'USDT' },
      { id: 'openingLoans', content: '200', unit: 'USDT' },
      { id: 'loansDrawn', content: '300', unit: 'USDT' },
      { id: 'interestAccrued', content: '400', unit: 'USDT' },
      { id: 'interestPayments', content: '500', unit: 'USDT' },
      { id: 'principalRepayments', content: '600', unit: 'USDT' },
      { id: 'unrealisedLosses', content: '700', unit: 'USDT' },
    ],
  },
  upcomingFunds: {
    title: 'Upcoming Lending Funds Flow',
    titleSuffix: '(Current Epoch)',
    metrics: [
      { id: 'netInflows', content: '800', unit: 'USDT' },
      { id: 'upcomingLoan', content: '900', unit: 'USDT' },
      { id: 'upcomingInterest', content: '1000', unit: 'USDT' },
      { id: 'upcomingPrincipal', content: '1100', unit: 'USDT' },
    ],
  },
  transactions: {
    title: 'Cumulative Deposits & Withdrawals',
    titleSuffix: '(Actual)',
    metrics: [
      { id: 'netDeposit', content: '1200', unit: 'USDT' },
      { id: 'cumulativeDeposit', content: '1300', unit: 'USDT' },
      { id: 'cumulativeWithdraw', content: '1400', unit: 'USDT' },
    ],
  },
  fundsRequest: {
    title: 'Cumulative Deposits & Withdrawals',
    titleSuffix: '(Actual)',
    metrics: [
      { id: 'netDeposits', content: '1500', unit: 'USDT' },
      { id: 'currentDeposits', content: '1600', unit: 'USDT' },
      { id: 'currentWithdrawal', content: '1700', unit: 'USDT' },
    ],
  },
}

const RepaymentsCard: React.FC = () => {
  const { t } = useTranslation()
  const { nextEpochTime = 0 } = useNextEpochTime()

  const formattedDate = formatTimestampWithOffset(nextEpochTime, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

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
          <InfoColumn
            showDivider
            containerSx={{ width: '50%', pr: 1 }}
            title={t(
              'repayments.sections.aggregated.metrics.totalBorrowers.label'
            )}
            toolTipInfo={t(
              'repayments.sections.aggregated.metrics.totalBorrowers.tooltip'
            )}
            metric={
              <Typography variant='h6' pl={2} mt={1}>
                1
              </Typography>
            }
          />
          <InfoColumn
            showDivider
            containerSx={{ width: '50%', pl: 1 }}
            title='Next Clearing Period Starts in'
            metric={
              <Box px={2} py='6px'>
                <Typography variant='h6' component='span' display='block'>
                  <Countdown
                    endTime={nextEpochTime ?? 0}
                    format='D:HH:mm'
                    render={(countDown) => {
                      const [days, hours, minutes] = countDown.split(':')
                      return `${days} ${t('time.days')} • ${hours} ${t(
                        'time.hours'
                      )} • ${minutes} ${t('time.minutes')}`
                    }}
                  />
                </Typography>
                <Typography variant='body1' color='grey.500'>
                  {date} • {time}{' '}
                  <span style={{ fontSize: '0.75rem' }}>
                    {format}
                    {offset}
                  </span>
                </Typography>
              </Box>
            }
          />
        </Box>

        <Grid container spacing={2} mt={1}>
          {Object.keys(fundsFlowReport).map((sectionKey) => (
            <Grid item xs={12} md={6} key={sectionKey}>
              <Box sx={{ width: '100%' }}>
                <Typography variant='h6'>
                  {t(`repayments.sections.${sectionKey}.title`)}
                </Typography>
                <Typography variant='body1' sx={{ mb: 2 }}>
                  {t(`repayments.sections.${sectionKey}.titleSuffix`)}
                </Typography>

                <RenderMetrics
                  metricsSection={fundsFlowReport[sectionKey]}
                  sectionKey={sectionKey}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  )
}

export default RepaymentsCard
