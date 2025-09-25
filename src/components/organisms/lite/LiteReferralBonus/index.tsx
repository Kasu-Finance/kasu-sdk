import { Box, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'
import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import LiteReferralBonusTooltip from '@/components/molecules/tooltips/Lite/LiteReferralBonusTooltip'
import LiteReferralBonusTableBody from '@/components/organisms/lite/LiteReferralBonus/LiteReferralBonusTableBody'
import LiteReferralBonusTableHeader from '@/components/organisms/lite/LiteReferralBonus/LiteReferralBonusTableHeader'
import LiteReferralLink from '@/components/organisms/lite/LiteReferralBonus/LiteReferralLink'

const LiteReferralBonus = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Box display='flex' alignItems='center'>
        <Typography variant='h3' color='gold.dark'>
          {t('lite.referralBonus.title')}
        </Typography>
        <ToolTip
          title={<LiteReferralBonusTooltip />}
          iconSx={{
            color: 'gold.dark',
            '&:hover': {
              color: 'gold.extraDark',
            },
          }}
        />
      </Box>
      <LiteModeTable
        tableHeader={<LiteReferralBonusTableHeader />}
        tableBody={<LiteReferralBonusTableBody />}
      />
      <LiteReferralLink />
    </Stack>
  )
}

export default LiteReferralBonus
