import { Box, Card, Typography } from '@mui/material'

import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import { BluedBgBox } from '@/components/molecules/details/PoolDelegateCard'

import mockResponseWithId from '@/mock-data/pool-details/mockResponse'

const PoolDetailsCard = () => {
  const { t } = useTranslation()
  const metrics = mockResponseWithId.poolDetails.data.metrics

  const apyAndAssetClassMetrics = metrics.filter(
    (metric) => metric.id === 'apy' || metric.id === 'assetClass'
  )

  const otherMetrics = metrics.filter(
    (metric) => metric.id !== 'apy' && metric.id !== 'assetClass'
  )

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' mb={2}>
        {t('details.poolDetails.title')}
      </Typography>

      <Box display='flex' justifyContent='space-between' width='100%'>
        {apyAndAssetClassMetrics.map(({ id, metric, unit }) => (
          <BluedBgBox key={id} flexDirection='column' sx={{ pb: 1 }}>
            <InfoRow
              title={t(`details.poolDetails.${id}` as TranslationKeys)}
              toolTipInfo={t(
                `details.poolDetails.${id}Tooltip` as TranslationKeys
              )}
              showDivider
              metric={<></>}
            />
            <Typography variant={id === 'apy' ? 'h5' : 'h6'} pl={2} mt={0.5}>
              {metric} {unit}
            </Typography>
          </BluedBgBox>
        ))}
      </Box>

      <Box
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        mt={2}
        width='100%'
      >
        <Box display='flex' flexDirection='column' flex={1}>
          {otherMetrics
            .slice(0, otherMetrics.length / 2)
            .map(({ id, metric, unit }, index) => (
              <InfoRow
                key={id}
                title={t(`details.poolDetails.${id}` as TranslationKeys)}
                toolTipInfo={t(
                  `details.poolDetails.${id}Tooltip` as TranslationKeys
                )}
                showDivider={index === 0}
                metric={
                  <Typography variant='body2'>
                    {metric} {unit}
                  </Typography>
                }
              />
            ))}
        </Box>
        <Box display='flex' flexDirection='column' flex={1}>
          {otherMetrics
            .slice(otherMetrics.length / 2)
            .map(({ id, metric, unit }, index) => (
              <InfoRow
                key={id}
                title={t(`details.poolDetails.${id}` as TranslationKeys)}
                toolTipInfo={t(
                  `details.poolDetails.${id}Tooltip` as TranslationKeys
                )}
                showDivider={index === 0}
                metric={
                  <Typography variant='body2'>
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

export default PoolDetailsCard
