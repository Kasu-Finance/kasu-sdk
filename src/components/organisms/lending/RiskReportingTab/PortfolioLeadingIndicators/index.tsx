import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import AddedDebtor from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/AddedDebtor'
import CollectionsPerformance from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/CollectionsPerformance'
import CreditRiskExposureStatus from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/CreditRiskExposureStatus'
import RiskConcentrationsTable from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable'
import RiskSegments from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskSegments'

const PortfolioLeadingIndicators = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('risk.portfolioLeadingIndicators.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3, px: 0 }}>
        <Box display='flex' justifyContent='space-between' px={2} mb={6}>
          <AddedDebtor />
          <RiskSegments />
        </Box>
        <RiskConcentrationsTable />
        <Box display='flex' justifyContent='space-between' px={2} mt={4}>
          <CreditRiskExposureStatus />
          <CollectionsPerformance />
        </Box>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PortfolioLeadingIndicators
