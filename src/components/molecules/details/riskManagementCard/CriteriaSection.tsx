import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import { PoolMetric } from 'kasu-sdk/src/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricsSection from '@/components/molecules/details/riskManagementCard/MetricsSection'

interface CriteriaSectionProps {
  criteriaMetrics: PoolMetric[]
}

const CriteriaSection: React.FC<CriteriaSectionProps> = ({
  criteriaMetrics,
}) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' width='100%' flexDirection='column'>
      <Typography variant='subtitle1' sx={{ mt: 3 }}>
        {t('details.riskManagement.criteria.title')}
      </Typography>

      <MetricsSection
        metrics={criteriaMetrics}
        prefixKey='details.riskManagement.criteria'
      />
    </Box>
  )
}

export default CriteriaSection
