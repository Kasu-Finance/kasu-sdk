import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'

const Exemption = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={4}>
      <Subheading title={t('modals.termsAndConditions.subheader-10.title')} />

      <Stack spacing={2}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-10.description')}
        </Typography>

        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>{t('modals.termsAndConditions.subheader-10.list-1.list-0')}</li>
          <li>{t('modals.termsAndConditions.subheader-10.list-1.list-1')}</li>
          <li>{t('modals.termsAndConditions.subheader-10.list-1.list-2')}</li>
        </UnorderedList>
      </Stack>
    </Stack>
  )
}

export default Exemption
