import { Box, Card, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import MetricTextUnit from '@/components/molecules/details/MetricTextUnit'

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
        {metrics.map((metric, index) => (
          <Box
            key={metric.id}
            display='flex'
            width='100%'
            flexDirection='column'
            pl={index > 0 ? 1 : 0}
          >
            <MetricTextUnit
              metric={metric}
              containerSx={{ pr: index === metrics.length - 1 ? 0 : 0.5 }}
              typographySx={{ pb: 1 }}
              titleKey={`details.poolTraction.${metric.id}.label`}
              tooltipKey={`details.poolTraction.${metric.id}.tooltip`}
            />
          </Box>
        ))}
      </Box>
    </Card>
  )
}

export default PoolTractionCard
