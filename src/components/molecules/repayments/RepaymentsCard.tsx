import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material'
import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'
import InfoColumn from '@/components/atoms/InfoColumn'
import RenderMetrics from '@/components/molecules/repayments/RenderMetrics'

import {
  adaptDataForRepayments,
  extractDateAndUtcOffset,
  formatTimestampWithOffset,
} from '@/utils'
import { RepaymentsSections } from '@/utils/convert/adaptDataForRepayments'

interface RepaymentsCardProps {
  data: PoolRepayment
}

const RepaymentsCard: React.FC<RepaymentsCardProps> = ({ data }) => {
  const { t } = useTranslation()
  const { nextEpochTime } = useNextEpochTime()

  const repaymentsData = adaptDataForRepayments(data)
  const endBorrowerFunds = data?.currentTotalEndBorrowers ?? 0

  const formattedDate = formatTimestampWithOffset(nextEpochTime, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={<Typography variant='h6'>{t('repayments.title')}</Typography>}
      />
      <CardContent sx={{ padding: 2 }}>
        <Box display='flex' justifyContent='space-between'>
          <CsvDownloadButton
            onDownload={() =>
              window.open(data?.repaymentsFileUrl || '', '_blank')
            }
          />
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
          <Typography variant='subtitle1'>
            {t('repayments.sections.aggregated.title')}
          </Typography>

          <Typography variant='body2' mt={2}>
            {t('repayments.sections.aggregated.description')}
          </Typography>

          <Box
            display='flex'
            width='100%'
            className='light-colored-background'
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
                  {endBorrowerFunds}
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
                      endTime={nextEpochTime}
                      format='D:HH:mm'
                      render={(countDown) => {
                        const [days, hours, minutes] = countDown.split(':')
                        return `${days} ${t('time.days')} • ${hours} ${t(
                          'time.hours'
                        )} • ${minutes} ${t('time.minutes')}`
                      }}
                    />
                  </Typography>
                  {date && time && (
                    <Typography variant='body1' color='grey.500'>
                      {date} • {time}{' '}
                      <span style={{ fontSize: '0.75rem' }}>
                        {format}
                        {offset}
                      </span>
                    </Typography>
                  )}
                </Box>
              }
            />
          </Box>

          <Grid container spacing={2} mt={1}>
            {Object.keys(repaymentsData).map((sectionKey) => (
              <Grid item xs={12} md={6} key={sectionKey}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant='subtitle1'>
                    {t(`repayments.sections.${sectionKey}.title`)}
                  </Typography>
                  <Typography variant='caption' sx={{ mb: 2 }} component='p'>
                    {t(`repayments.sections.${sectionKey}.titleSuffix`)}
                  </Typography>

                  <RenderMetrics
                    data={
                      repaymentsData[sectionKey as keyof RepaymentsSections]
                    }
                    sectionKey={sectionKey}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default RepaymentsCard
