import { Box, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CurrentLoyaltyLevel from '@/components/atoms/CurrentLoyaltyLevel'
import CurrentLoyaltyMascot from '@/components/atoms/CurrentLoyaltyMascot'
import LearnButton from '@/components/organisms/lending/OverviewTab/UserLoyalty/LearnButton'
import CurrentLoyaltyBenefits from '@/components/organisms/lite/LiteLoyaltyInfo/CurrentLoyaltyBenefits'
import CurrentLoyaltyProgressStepper from '@/components/organisms/lite/LiteLoyaltyInfo/CurrentLoyaltyProgressStepper'

const LiteLoyaltyInfo = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3.5} alignItems='center'>
      <Box>
        <Typography
          variant='h3'
          color='gold.dark'
          maxWidth={330}
          textAlign='center'
          mb={2}
          px={{ xs: 1, md: 0 }}
        >
          {t('lite.loyaltyInfo.title')}
        </Typography>
        <CurrentLoyaltyMascot
          style={{ width: 'min(320px, 100%)', height: 'auto' }}
        />
        <Stack spacing={3} mt={-4}>
          <CurrentLoyaltyLevel color='white' textAlign='center' />
          <CurrentLoyaltyProgressStepper />
        </Stack>
      </Box>
      <CurrentLoyaltyBenefits />
      <LearnButton />
    </Stack>
  )
}

export default LiteLoyaltyInfo
