import { Box, Card, Typography } from '@mui/material'

import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import mockResponseWithId from '@/mock-data/pool-details/mockResponse'

const PoolTractionCard = () => {
  const { t } = useTranslation()
  const { metrics } = mockResponseWithId.poolTraction.data

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' mb={2}>
        {t('details.poolTraction.title')}
      </Typography>

      <Box display='flex' alignItems='center'>
        {metrics.map(({ metric, unit, id }, index) => (
          <Box
            key={id}
            display='flex'
            width='100%'
            flexDirection='column'
            pl={index > 0 ? 1 : 0}
          >
            <InfoRow
              title={t(`details.poolTraction.${id}` as TranslationKeys)}
              toolTipInfo={t(
                `details.poolTraction.${id}Tooltip` as TranslationKeys
              )}
              showDivider
              metric={<></>}
            />
            <Typography variant='h6' component='span' sx={{ pl: 2 }}>
              {metric}{' '}
              <Typography variant='body1' component='span'>
                {unit}
              </Typography>
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}

export default PoolTractionCard
