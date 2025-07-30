import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import LiteReferralBonusTableBody from '@/components/organisms/lite/LiteReferralBonus/LiteReferralBonusTableBody'
import LiteReferralBonusTableHeader from '@/components/organisms/lite/LiteReferralBonus/LiteReferralBonusTableHeader'
import LiteReferralLink from '@/components/organisms/lite/LiteReferralBonus/LiteReferralLink'

const LiteReferralBonus = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Typography variant='h3' color='gold.dark'>
        {t('lite.referralBonus.title')}
      </Typography>
      <LiteModeTable
        tableHeader={<LiteReferralBonusTableHeader />}
        tableBody={<LiteReferralBonusTableBody />}
      />
      <LiteReferralLink />
    </Stack>
  )
}

export default LiteReferralBonus
