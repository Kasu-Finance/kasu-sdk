import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricsSection from '@/components/molecules/details/RiskManagementCard/MetricsSection'

import { PoolMetric } from '@/types/lending'

interface SecuritySectionProps {
  securityMetrics: PoolMetric[]
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  securityMetrics,
}) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' width='100%' flexDirection='column'>
      <Typography variant='subtitle1' sx={{ mt: 3 }}>
        {t('details.riskManagement.security.title')}
      </Typography>

      <MetricsSection
        metrics={securityMetrics}
        prefixKey='details.riskManagement.security'
      />
    </Box>
  )
}

export default SecuritySection
