import { Container, Stack } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import BackButton from '@/components/atoms/BackButton'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import ConcentrationRisk from '@/components/organisms/riskWarning/ConcentrationRisk'
import CreditRisk from '@/components/organisms/riskWarning/CreditRisk'
import CurrencyExchangeRisk from '@/components/organisms/riskWarning/CurrencyExchangeRisk'
import DataSecurity from '@/components/organisms/riskWarning/DataSecurity'
import DelegateCounterPartyRisk from '@/components/organisms/riskWarning/DelegateCounterPartyRisk'
import GeneralRisks from '@/components/organisms/riskWarning/GeneralRisks'
import InterestRateRisk from '@/components/organisms/riskWarning/InterestRateRisk'
import MarketRisk from '@/components/organisms/riskWarning/MarketRisk'
import NoGuarantee from '@/components/organisms/riskWarning/NoGuarantee'
import PerformanceRisk from '@/components/organisms/riskWarning/PerformanceRisk'
import ProtocolRisks from '@/components/organisms/riskWarning/ProtocolRisks'
import SmartContractRisk from '@/components/organisms/riskWarning/SmartContractRisk'
import Warning from '@/components/organisms/riskWarning/Warning'

const RiskWarningPage = () => {
  const { t } = useTranslation()

  return (
    <Container maxWidth='lg'>
      <CustomCard>
        <CustomCardHeader title={t('modals.riskWarning.title')} />
        <CustomInnerCardContent>
          <Stack spacing={4}>
            <GeneralRisks />
            <Warning />
            <PerformanceRisk />
            <MarketRisk />
            <InterestRateRisk />
            <CreditRisk />
            <DelegateCounterPartyRisk />
            <ProtocolRisks />
            <SmartContractRisk />
            <ConcentrationRisk />
            <CurrencyExchangeRisk />
            <NoGuarantee />
            <DataSecurity />
            <BackButton
              variant='contained'
              sx={{
                maxWidth: 368,
                textTransform: 'capitalize',
                alignSelf: 'center',
              }}
              fullWidth
            >
              Back
            </BackButton>
          </Stack>
        </CustomInnerCardContent>
      </CustomCard>
    </Container>
  )
}

export default RiskWarningPage
