import { Box, Card, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CriteriaSection from '@/components/molecules/details/riskManagementCard/CriteriaSection'
import RiskStatus from '@/components/molecules/details/riskManagementCard/RiskStatus'
import SecuritySection from '@/components/molecules/details/riskManagementCard/SecuritySection'

import { RiskManagementSection } from '@/types/poolDetails'

interface RiskManagementCardProps {
  riskManagementData: RiskManagementSection
}

const RiskManagementCard: React.FC<RiskManagementCardProps> = ({
  riskManagementData,
}) => {
  const { t } = useTranslation()
  const { riskStatus, security, criteria } = riskManagementData

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' mb={4}>
        {t('details.riskManagement.title')}
      </Typography>

      <RiskStatus metrics={riskStatus.metrics} />

      <Box display='flex'>
        <SecuritySection securityMetrics={security.metrics} />
        <CriteriaSection criteriaMetrics={criteria.metrics} />
      </Box>
    </Card>
  )
}

export default RiskManagementCard
