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

import ColoredBox from '@/components/atoms/ColoredBox'
import Countdown from '@/components/atoms/Countdown'
import CsvDownloadButton from '@/components/atoms/CsvDownloadButton'
import InfoColumn from '@/components/atoms/InfoColumn'
import RepaymentsDataCard from '@/components/molecules/repayments/RepaymentsDataCard'

import { formatTimestamp } from '@/utils'

interface RepaymentsCardProps {
  data: PoolRepayment
}

const RepaymentsCard: React.FC<RepaymentsCardProps> = ({ data }) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const endBorrowerFunds = data?.currentTotalEndBorrowers ?? 0

  const formattedTime = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
            {t('repayments.title')}
          </Typography>
        }
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />
      <CardContent
        sx={(theme) => ({
          p: 2,
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <Box>
          <Typography variant='body2'>
            {t('repayments.loanModelDescription')}
          </Typography>
          <Box display='flex' justifyContent='space-between' mt={2}>
            <CsvDownloadButton
              onDownload={() =>
                window.open(data?.repaymentsFileUrl || '', '_blank')
              }
              fullWidth={isMobile}
            />
          </Box>
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
          <ColoredBox
            mt={2}
            p={{ xs: 1, sm: 0 }}
            sx={(theme) => ({
              [theme.breakpoints.up('sm')]: {
                display: 'flex',
              },
            })}
          >
            <InfoColumn
              showDivider
              containerSx={{
                width: isMobile ? '100%' : '50%',
                pl: isMobile ? 0 : 1,
              }}
              title={t(
                'repayments.sections.aggregated.metrics.totalBorrowers.label'
              )}
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
              titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
              toolTipInfo={t(
                'repayments.sections.aggregated.metrics.totalBorrowers.tooltip'
              )}
              metric={
                <Typography variant='h6' pl={{ xs: 0, sm: 2 }} mt={1}>
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
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
              titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
              metric={
                <Box px={{ xs: 0, sm: 2 }} py='6px'>
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
          </ColoredBox>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <RepaymentsDataCard
                title={t('repayments.sections.cumulativeFunds.title')}
                subtitle={t('repayments.sections.cumulativeFunds.titleSuffix')}
                data={data.cumulativeLendingFundsFlow}
                unit='USD'
              />
              <RepaymentsDataCard
                title={t('repayments.sections.upcomingFunds.title')}
                subtitle={t('repayments.sections.upcomingFunds.titleSuffix')}
                data={data.upcomingLendingFundsFlow}
                unit='USD'
                sx={{ mt: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RepaymentsDataCard
                title={t('repayments.sections.transactions.title')}
                subtitle={t('repayments.sections.transactions.titleSuffix')}
                data={data.cumulativeLendingAndWithdrawals}
                unit='USDC'
                sx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    mt: 3,
                  },
                })}
              />
              <RepaymentsDataCard
                title={t('repayments.sections.fundsRequest.title')}
                subtitle={t('repayments.sections.fundsRequest.titleSuffix')}
                data={data.lendingAndWithdrawalRequests}
                unit='USDC'
                sx={{ mt: 3 }}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default RepaymentsCard
