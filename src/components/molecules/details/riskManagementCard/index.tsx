import { Card, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import RiskStatus from '@/components/molecules/details/riskManagementCard/RiskStatus'
import SecurityAndCriteria from '@/components/molecules/details/riskManagementCard/SecurityAndCriteria'

import mockResponseWithId from '@/mock-data/pool-details/mockResponse'

const RiskManagementCard = () => {
  const { t } = useTranslation()
  const { riskStatus, security, criteria } = mockResponseWithId.riskManagement

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' mb={4}>
        {t('details.riskManagement.title')}
      </Typography>

      <RiskStatus metrics={riskStatus.metrics} />

      <SecurityAndCriteria
        securityMetrics={security.metrics}
        criteriaMetrics={criteria.metrics}
      />
    </Card>
  )
}

export default RiskManagementCard
