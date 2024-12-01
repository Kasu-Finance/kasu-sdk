import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import WaveBox from '@/components/atoms/WaveBox'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'

const FeesExplanation = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={4}>
      <Subheading title={t('modals.termsAndConditions.subheader-3.title')} />
      <WaveBox px={2} py={3}>
        <Stack spacing={2}>
          <Typography variant='h6'>
            {t('modals.termsAndConditions.subheader-3.description-1')}
          </Typography>
          <Typography variant='baseMdBold'>
            {t('modals.termsAndConditions.subheader-3.description-2')}
          </Typography>
        </Stack>
      </WaveBox>
      <Stack spacing={2}>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-3.description-3')}
        </Typography>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-3.description-4')}
        </Typography>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-3.description-5')}
        </Typography>
        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.termsAndConditions.subheader-3.list-1.list-0.title')}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-3.list-1.list-0.description'
            )}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.termsAndConditions.subheader-3.list-1.list-1.title')}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-3.list-1.list-1.description'
            )}
          </li>
        </UnorderedList>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-3.description-6')}
        </Typography>

        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>{t('modals.termsAndConditions.subheader-3.list-2.list-0')}</li>
          <li>{t('modals.termsAndConditions.subheader-3.list-2.list-1')}</li>
        </UnorderedList>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-3.description-7')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default FeesExplanation
