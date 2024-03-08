import { Box, Typography } from '@mui/material'
import React from 'react'

import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { PoolMetric } from '@/mock-data/pool-details/mockResponse'

interface SecurityStructureProps {
  securityMetrics: PoolMetric[]
  criteriaMetrics: PoolMetric[]
}

const MetricsSection: React.FC<{
  metrics: PoolMetric[]
  prefixKey: string
}> = ({ metrics, prefixKey }) => {
  const { t } = useTranslation()

  return (
    <Box width='50%' display='flex' flexDirection='column' pr={2}>
      {metrics.map(({ value, id }) => (
        <Box key={id} sx={{ mt: 1 }}>
          <InfoRow
            title={t(`${prefixKey}.${id}.label` as TranslationKeys)}
            toolTipInfo={t(`${prefixKey}.${id}.tooltip` as TranslationKeys)}
            showDivider
            metric={<></>}
          />
          {Array.isArray(value) ? (
            value.map((item, index) => (
              <Typography key={index} variant='body2' sx={{ pl: 2, mt: 0.5 }}>
                • {item}
              </Typography>
            ))
          ) : (
            <Typography variant='body2' sx={{ pl: 2, mt: 0.5 }}>
              {value}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

const SecurityAndCriteria: React.FC<SecurityStructureProps> = ({
  securityMetrics,
  criteriaMetrics,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Box display='flex' width='100%' justifyContent='space-between'>
        <Typography variant='subtitle1' sx={{ mt: 3 }} width='50%'>
          {t('details.riskManagement.security.title')}
        </Typography>
        <Typography variant='subtitle1' sx={{ mt: 3 }} width='50%'>
          {t('details.riskManagement.criteria.title')}
        </Typography>
      </Box>

      <Box display='flex' width='100%'>
        <MetricsSection
          metrics={securityMetrics}
          prefixKey='details.riskManagement.security'
        />
        <MetricsSection
          metrics={criteriaMetrics}
          prefixKey='details.riskManagement.criteria'
        />
      </Box>
    </>
  )
}

export default SecurityAndCriteria
