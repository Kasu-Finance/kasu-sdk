import { Container, Stack } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import BackButton from '@/components/atoms/BackButton'
import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import FeesExplanation from '@/components/organisms/termsAndConditions/FeesExplanation'
import InterestAccrual from '@/components/organisms/termsAndConditions/InterestAccrual'
import LoanWithdrawalRequests from '@/components/organisms/termsAndConditions/LoanWithdrawalRequests'
import PendingPhase from '@/components/organisms/termsAndConditions/PendingPhase'
import RiskDisclosure from '@/components/organisms/termsAndConditions/RiskDisclosure'
import TrancheAllocation from '@/components/organisms/termsAndConditions/TrancheAllocation'
import Warning from '@/components/organisms/termsAndConditions/Warning'

const TermsAndConditionsPage = () => {
  const { t } = useTranslation()

  return (
    <Container maxWidth='lg'>
      <CustomCard>
        <CustomCardHeader title={t('modals.termsAndConditions.title')} />
        <CustomInnerCardContent>
          <Stack spacing={4}>
            <RiskDisclosure />
            <Warning />
            <FeesExplanation />
            <InterestAccrual />
            <PendingPhase />
            <LoanWithdrawalRequests />
            <TrancheAllocation />
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

export default TermsAndConditionsPage
