import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { PoolRepayment } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import Countdown from '@/components/atoms/Countdown'
import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'
import InfoColumn from '@/components/atoms/InfoColumn'
import RenderMetrics from '@/components/molecules/repayments/RenderMetrics'

import { adaptDataForRepayments, formatTimestamp } from '@/utils'
import { RepaymentsSections } from '@/utils/convert/adaptDataForRepayments'

interface RepaymentsCardProps {
  data: PoolRepayment
}

const RepaymentsCard: React.FC<RepaymentsCardProps> = ({ data }) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const repaymentsData = adaptDataForRepayments(data)
  const endBorrowerFunds = data?.currentTotalEndBorrowers ?? 0

  const formattedTime = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

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
            flexDirection={isMobile ? 'column' : 'row'}
            width='100%'
            className='light-colored-background'
            mt={2}
          >
            <InfoColumn
              showDivider
              containerSx={{ width: isMobile ? '100%' : '50%', pr: 1 }}
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
              containerSx={{
                width: isMobile ? '100%' : '50%',
                pl: isMobile ? 0 : 1,
              }}
              title={t('general.nextClearingPeriodStart')}
              metric={
                <Box px={2} py='6px'>
                  {isLoading ? (
                    <>
                      <Skeleton variant='rounded' height={28} width={200} />
                      <Skeleton
                        variant='rounded'
                        height={18}
                        width={150}
                        sx={{ mt: 1 }}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant='h6' component='span' display='block'>
                        <Countdown
                          endTime={nextClearingPeriod}
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
                        {formattedTime.date} • {formattedTime.timestamp}{' '}
                        <Typography
                          variant='caption'
                          color='inherit'
                          component='span'
                        >
                          {formattedTime.utcOffset}
                        </Typography>
                      </Typography>
                    </>
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
