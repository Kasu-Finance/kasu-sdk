import { Container, Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import BackButton from '@/components/organisms/riskWarning/BackButton'
import ConcentrationRisk from '@/components/organisms/riskWarning/ConcentrationRisk'
import CreditRisk from '@/components/organisms/riskWarning/CreditRisk'
import CurrencyExchangeRisk from '@/components/organisms/riskWarning/CurrencyExchangeRisk'
import DataSecurity from '@/components/organisms/riskWarning/DataSecurity'
import DelegateCounterPartyRisk from '@/components/organisms/riskWarning/DelegateCounterPartyRisk'
import GeneralRisks from '@/components/organisms/riskWarning/GeneralRisks'
import IncomeAndCapitalRisk from '@/components/organisms/riskWarning/IncomeAndCapitalRisk'
import InterestRateRisk from '@/components/organisms/riskWarning/InterestRateRisk'
import LiquidityRisk from '@/components/organisms/riskWarning/LiquidityRisk'
import MarketRisk from '@/components/organisms/riskWarning/MarketRisk'
import NoGuarantee from '@/components/organisms/riskWarning/NoGuarantee'
import PerformanceRisk from '@/components/organisms/riskWarning/PerformanceRisk'
import PoliticalRisk from '@/components/organisms/riskWarning/PoliticalRisk'
import ProtocolRisks from '@/components/organisms/riskWarning/ProtocolRisks'
import SmartContractRisk from '@/components/organisms/riskWarning/SmartContractRisk'
import TrancheRisk from '@/components/organisms/riskWarning/TrancheRisk'

const RiskWarningPage = () => {
  const { t } = useTranslation()

  return (
    <Container maxWidth='lg'>
      <CustomCard>
        <CustomCardHeader title={t('modals.riskWarning.title')} />
        <CustomInnerCardContent>
          <Stack spacing={4}>
            <Typography variant='baseMdBold'>
              {t('modals.riskWarning.description')}
            </Typography>
            <GeneralRisks />
            <IncomeAndCapitalRisk />
            <PerformanceRisk />
            <MarketRisk />
            <InterestRateRisk />
            <CreditRisk />
            <DelegateCounterPartyRisk />
            <ProtocolRisks />
            <SmartContractRisk />
            <ConcentrationRisk />
            <TrancheRisk />
            <CurrencyExchangeRisk />
            <PoliticalRisk />
            <LiquidityRisk />
            <DataSecurity />
            <NoGuarantee />
            <BackButton />
          </Stack>
        </CustomInnerCardContent>
      </CustomCard>
    </Container>
  )
}

export default RiskWarningPage
