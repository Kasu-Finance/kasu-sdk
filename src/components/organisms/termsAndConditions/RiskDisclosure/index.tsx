import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import NextLink from '@/components/atoms/NextLink'
import WaveBox from '@/components/atoms/WaveBox'
import LoanContractButton from '@/components/organisms/termsAndConditions/RiskDisclosure/LoanContractButton'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { Routes } from '@/config/routes'
import { customPalette } from '@/themes/palette'

const RiskDisclosure = () => {
  const { t } = getTranslation()

  return (
    <WaveBox px={2} py={3}>
      <Subheading title={t('modals.termsAndConditions.subheader-1.title')} />
      <Stack spacing={1} mt={2}>
        <Typography variant='baseMdBold'>
          {t('modals.termsAndConditions.subheader-1.description-1')}
        </Typography>
        <Typography variant='baseMdBold'>
          {t('modals.termsAndConditions.subheader-1.description-2')}
        </Typography>
        <Typography variant='baseMdBold'>
          <NextLink
            href={Routes.docs.root.url}
            style={{ font: 'inherit', color: customPalette.gold.dark }}
          >
            User Docs
          </NextLink>{' '}
          and <LoanContractButton />.
        </Typography>
        <Typography variant='baseMdBold'>
          {t('modals.termsAndConditions.subheader-1.description-3')}
        </Typography>
      </Stack>
    </WaveBox>
  )
}

export default RiskDisclosure
