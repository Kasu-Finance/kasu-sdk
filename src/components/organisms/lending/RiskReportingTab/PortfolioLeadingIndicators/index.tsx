import { Box, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import AddedDebtor from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/AddedDebtor'
import RiskSegments from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators/RiskSegments'

const PortfolioLeadingIndicators = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('risk.portfolioLeadingIndicators.title')}
      </Typography>
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Box display='flex' justifyContent='space-between'>
          <AddedDebtor />
          <RiskSegments />
        </Box>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PortfolioLeadingIndicators
