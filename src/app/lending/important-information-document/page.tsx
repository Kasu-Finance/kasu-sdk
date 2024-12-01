import { Container, Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import AutomatedOptIn from '@/components/organisms/termsAndConditions/AutomatedOptIn'
import BackButton from '@/components/organisms/termsAndConditions/BackButton'
import FeesExplanation from '@/components/organisms/termsAndConditions/FeesExplanation'
import FixedApyLoan from '@/components/organisms/termsAndConditions/FixedApyLoan'
import ImportantInformation from '@/components/organisms/termsAndConditions/ImportantInformation'
import InterestAccrual from '@/components/organisms/termsAndConditions/InterestAccrual'
import LoanWithdrawalRequests from '@/components/organisms/termsAndConditions/LoanWithdrawalRequests'
import PendingPhase from '@/components/organisms/termsAndConditions/PendingPhase'
import RiskDisclosure from '@/components/organisms/termsAndConditions/RiskDisclosure'
import TrancheAllocation from '@/components/organisms/termsAndConditions/TrancheAllocation'

const TermsAndConditionsPage = () => {
  const { t } = getTranslation()

  return (
    <Container maxWidth='lg'>
      <CustomCard>
        <CustomCardHeader title={t('modals.termsAndConditions.title')} />
        <CustomInnerCardContent>
          <Stack spacing={4}>
            <ImportantInformation />
            <RiskDisclosure />
            <AutomatedOptIn />
            <FeesExplanation />
            <InterestAccrual />
            <PendingPhase />
            <LoanWithdrawalRequests />
            <TrancheAllocation />
            <FixedApyLoan />
            <BackButton />
          </Stack>
        </CustomInnerCardContent>
      </CustomCard>
    </Container>
  )
}

export default TermsAndConditionsPage
