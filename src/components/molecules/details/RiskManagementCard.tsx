import { Box, Card, Typography } from '@mui/material'

import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import Rating from '@/components/atoms/Rating'
import { BluedBgBox } from '@/components/molecules/details/PoolDelegateCard'

import mockResponseWithId from '@/mock-data/pool-details/mockResponse'

const RiskManagementCard = () => {
  const { t } = useTranslation()
  const { riskPerformance, securityStructure, borrowerCriteria } =
    mockResponseWithId.riskManagement

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' mb={4}>
        {t('details.riskManagement.title')}
      </Typography>

      <Typography variant='subtitle1' sx={{ mb: 2 }}>
        {t(riskPerformance.title)}
      </Typography>

      <BluedBgBox flexDirection='row'>
        <Box width='50%' display='flex' flexDirection='column' pb={1.5} pr={1}>
          {riskPerformance.metrics
            .slice(0, 2)
            .map(({ metric, unit, id }, index) => (
              <Box
                key={id}
                display='flex'
                flexDirection='column'
                mt={index > 0 ? 1 : 0}
              >
                <InfoRow
                  title={t(`details.riskManagement.${id}` as TranslationKeys)}
                  toolTipInfo={t(
                    `details.riskManagement.${id}Tooltip` as TranslationKeys
                  )}
                  showDivider
                  metric={<></>}
                />
                <Typography
                  variant='h6'
                  color='grey.400'
                  sx={{ pl: 2, mt: 0.5 }}
                >
                  {metric}{' '}
                  {unit && (
                    <Typography variant='body2' component='span'>
                      {unit}
                    </Typography>
                  )}
                </Typography>
              </Box>
            ))}
        </Box>
        <Box width='50%' display='flex' flexDirection='column'>
          {riskPerformance.metrics
            .slice(2)
            .map(({ metric, id, isRating, unit }, index) => (
              <Box
                key={id}
                display='flex'
                flexDirection='column'
                pl={1}
                mt={index > 0 ? 1 : 0}
              >
                <InfoRow
                  title={t(`details.riskManagement.${id}` as TranslationKeys)}
                  toolTipInfo={t(
                    `details.riskManagement.${id}Tooltip` as TranslationKeys
                  )}
                  showDivider
                  metric={<></>}
                />
                {isRating ? (
                  <Rating
                    sx={{ pl: 2, mt: 0.5 }}
                    value={Number(metric)}
                    precision={0.5}
                    readOnly
                  />
                ) : (
                  <Typography variant='h6' sx={{ pl: 2, mt: 0.5 }}>
                    {metric}{' '}
                    {unit && (
                      <Typography
                        variant='body2'
                        component='span'
                        sx={{ fontSize: 12, position: 'relative', top: -2 }}
                      >
                        {unit}
                      </Typography>
                    )}
                  </Typography>
                )}
              </Box>
            ))}
        </Box>
      </BluedBgBox>

      <Box display='flex'>
        <Typography variant='subtitle1' sx={{ mt: 3, width: '50%' }}>
          {t(securityStructure.title)}
        </Typography>

        <Typography variant='subtitle1' sx={{ mt: 3, width: '50%' }}>
          {t(borrowerCriteria.title)}
        </Typography>
      </Box>

      <Box display='flex' flexDirection='row' width='100%'>
        <Box width='50%' display='flex' flexDirection='column'>
          {securityStructure.metrics.map(({ metric, id }) => (
            <Box key={id} display='flex' flexDirection='column' sx={{ mt: 1 }}>
              <InfoRow
                title={t(`details.riskManagement.${id}` as TranslationKeys)}
                toolTipInfo={t(
                  `details.riskManagement.${id}Tooltip` as TranslationKeys
                )}
                showDivider
                metric={<></>}
              />
              {Array.isArray(metric) ? (
                metric.map((item, index) => (
                  <Typography
                    key={index}
                    variant='body2'
                    sx={{ pl: 2, mt: 0.5 }}
                  >
                    • {item}
                  </Typography>
                ))
              ) : (
                <Typography variant='body2' sx={{ pl: 2, mt: 0.5 }}>
                  {metric}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        <Box width='50%' display='flex' flexDirection='column'>
          {borrowerCriteria.metrics.map(({ metric, id }) => (
            <Box key={id} display='flex' flexDirection='column' sx={{ mt: 1 }}>
              <InfoRow
                title={t(`details.riskManagement.${id}` as TranslationKeys)}
                toolTipInfo={t(
                  `details.riskManagement.${id}Tooltip` as TranslationKeys
                )}
                showDivider
                metric={<></>}
              />
              <Typography variant='body2' sx={{ pl: 2, mt: 0.5 }}>
                {metric}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  )
}

export default RiskManagementCard
