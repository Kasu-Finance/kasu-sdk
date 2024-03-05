'use client'

import { Box, Card, Typography } from '@mui/material'
import styled from 'styled-components'

import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import NextLink from '@/components/atoms/NextLink'

import mockResponseWithId from '@/mock-data/pool-details/mockResponse'

export const BluedBgBox = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
  background: '#1976D20A',
}))

const PoolDelegateCard = () => {
  const { t } = useTranslation()
  const metrics = mockResponseWithId.poolDelegate.data.metrics

  const firstArray = metrics.filter(
    (metric) =>
      metric.id === 'lendingHistory' ||
      metric.id === 'totalLoanFunds' ||
      metric.id === 'totalLoansOriginated'
  )

  const secondArray = metrics.filter(
    (metric) => metric.id === 'assetClasses' || metric.id === 'otherKasuPools'
  )

  const thirdArray = metrics.filter(
    (metric) =>
      metric.id === 'loansUnderManagement' || metric.id === 'historicalLossRate'
  )

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2 }} elevation={1}>
      <Typography variant='h6' mb={2}>
        {t('details.poolDelegate.title')}
      </Typography>

      <BluedBgBox justifyContent='space-between'>
        {firstArray.map(({ id, metric, unit }) => (
          <Box key={id} width='33%' flexDirection='column' sx={{ pb: 1 }}>
            <InfoRow
              title={t(`details.poolDelegate.${id}` as TranslationKeys)}
              toolTipInfo={t(
                `details.poolDelegate.${id}Tooltip` as TranslationKeys
              )}
              showDivider
              metric={<></>}
            />
            <Typography variant='h6' sx={{ pl: 2 }}>
              {metric}{' '}
              <Typography variant='body1' component='span'>
                {unit}
              </Typography>
            </Typography>
          </Box>
        ))}
      </BluedBgBox>

      <Box display='flex' justifyContent='space-between' width='100%' mt={2}>
        <Box display='flex' flexDirection='column' width='50%'>
          {secondArray.map(({ id, metric }) => (
            <InfoRow
              key={id}
              title={t(`details.poolDelegate.${id}` as TranslationKeys)}
              toolTipInfo={t(
                `details.poolDelegate.${id}Tooltip` as TranslationKeys
              )}
              showDivider={id === 'assetClasses'}
              metric={
                Array.isArray(metric) ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='flex-end'
                  >
                    {metric.map((item, itemIndex) => (
                      <NextLink
                        key={`${id}_${itemIndex}`}
                        href='#'
                        color='primary'
                        variant='body2'
                      >
                        {item}
                      </NextLink>
                    ))}
                  </Box>
                ) : (
                  <Typography variant='body2' component='span'>
                    {metric}
                  </Typography>
                )
              }
            />
          ))}
        </Box>

        <Box width='50%'>
          {thirdArray.map(({ id, metric, unit }, index) => (
            <InfoRow
              key={id}
              title={t(`details.poolDelegate.${id}` as TranslationKeys)}
              toolTipInfo={t(
                `details.poolDelegate.${id}Tooltip` as TranslationKeys
              )}
              showDivider={thirdArray.length - 1 !== index}
              metric={
                <Typography variant='h6'>
                  {metric} {unit}
                </Typography>
              }
            />
          ))}
        </Box>
      </Box>
    </Card>
  )
}

export default PoolDelegateCard
