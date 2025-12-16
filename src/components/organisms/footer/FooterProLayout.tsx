import { Box, Stack } from '@mui/material'

import AdditionalInformation from '@/components/organisms/footer/AdditionalInformation'
import LegalNotices from '@/components/organisms/footer/LegalNotices'
import PlatformDisclosures from '@/components/organisms/footer/PlatformDisclosures'
import SocialMedia from '@/components/organisms/footer/SocialMedia'

import BuiltOnBase from '@/assets/logo/BuildOnBaseLogo'
import KasuFooterLogo from '@/assets/logo/KasuFooterLogo'

const FooterProLayout = () => (
  <>
    <Box
      display='flex'
      gap={{ xs: 4, md: 8 }}
      flexDirection={{ xs: 'column', md: 'row' }}
    >
      <Stack spacing={2}>
        <Box display='flex' gap={2} alignItems='center'>
          <KasuFooterLogo />
          <BuiltOnBase />
        </Box>
        <SocialMedia />
      </Stack>
      <Box
        display='grid'
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 160px)' }}
        gridTemplateRows='max-content'
        rowGap={1}
        mt='auto'
        width={{ xs: '100%', md: 'auto' }}
      >
        <AdditionalInformation />
      </Box>
    </Box>

    <Box
      display='grid'
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(auto-fill, 160px)' }}
      rowGap={1}
      width={{ xs: '100%', md: 320 }}
    >
      <LegalNotices />
      <PlatformDisclosures />
    </Box>
  </>
)

export default FooterProLayout
