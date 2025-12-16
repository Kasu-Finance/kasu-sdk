import { Box, Button, Stack, Typography } from '@mui/material'

import AdditionalInformation from '@/components/organisms/footer/AdditionalInformation'
import LegalNotices from '@/components/organisms/footer/LegalNotices'
import PlatformDisclosures from '@/components/organisms/footer/PlatformDisclosures'
import SocialMedia from '@/components/organisms/footer/SocialMedia'

import KasuGold from '@/assets/logo/KasuGold'

const FooterLiteLayout = () => (
  <>
    <Box
      display='grid'
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 160px)' }}
      gridTemplateRows='max-content'
      rowGap={1}
      mt='auto'
      width={{ xs: '100%', md: 'auto' }}
    >
      <Typography variant='baseMdBold' gridColumn='1/3'>
        Additional Information:
      </Typography>
      <AdditionalInformation />
    </Box>
    <Stack justifyContent='center' alignItems='center' spacing={2} width='100%'>
      <KasuGold />
      <Button
        href='mailto:hello@kasu.finance'
        rel='noopener noreferrer'
        sx={{
          width: 'max-content',
          height: 'max-content',
          p: 0,
          color: 'gold.dark',
          textTransform: 'unset',
        }}
      >
        hello@kasu.finance
      </Button>
      <SocialMedia />
    </Stack>
    <Box
      display='grid'
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(auto-fill, 160px)' }}
      rowGap={1}
      width={{ xs: '100%', md: 320 }}
    >
      <LegalNotices isLiteMode />
      <PlatformDisclosures isLiteMode />
    </Box>
  </>
)

export default FooterLiteLayout
