import { Box, Stack } from '@mui/material'

import AdditionalInformation from '@/components/organisms/footer/AdditionalInformation'
import LegalNotices from '@/components/organisms/footer/LegalNotices'
import PlatformDisclosures from '@/components/organisms/footer/PlatformDisclosures'
import SocialMedia from '@/components/organisms/footer/SocialMedia'

import BuiltOnBase from '@/assets/logo/BuildOnBaseLogo'
import KasuFooterLogo from '@/assets/logo/KasuFooterLogo'

const FooterProLayout = () => (
  <>
    <Box display='flex' gap={8}>
      <Stack spacing={2}>
        <Box display='flex' gap={2} alignItems='center'>
          <KasuFooterLogo />
          <BuiltOnBase />
        </Box>
        <SocialMedia />
      </Stack>
      <Box
        display='grid'
        gridTemplateColumns='repeat(2, 160px)'
        gridTemplateRows='max-content'
        rowGap={1}
        mt='auto'
      >
        <AdditionalInformation />
      </Box>
    </Box>

    <Box
      display='grid'
      gridTemplateColumns='repeat(auto-fill, 160px)'
      rowGap={1}
      width={320}
    >
      <LegalNotices />
      <PlatformDisclosures />
    </Box>
  </>
)

export default FooterProLayout
