import { Box } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import RiskConcentrationsTable from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskConcentrationsTable'

const PortfolioLeadingIndicators = () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('risk.portfolioLeadingIndicators.title')} />
      <CustomInnerCardContent sx={{ py: 3, px: 0 }}>
        <Box display='flex' justifyContent='space-between' px={2} mb={6}>
          {/* <AddedDebtor />
          <RiskSegments /> */}
        </Box>
        <RiskConcentrationsTable />
        <Box display='flex' justifyContent='space-between' px={2} mt={4}>
          {/* <CreditRiskExposureStatus />
          <CollectionsPerformance /> */}
        </Box>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PortfolioLeadingIndicators
