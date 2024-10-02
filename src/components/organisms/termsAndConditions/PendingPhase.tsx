import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'

const PendingPhase = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.termsAndConditions.subheader-5.title')} />
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-5.description')}
        </Typography>
        <Stack spacing={1}>
          <Typography variant='h6'>
            {t('modals.termsAndConditions.subheader-5.list.title')}
          </Typography>
          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-5.list.list-0.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-5.list.list-0.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-5.list.list-1.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-5.list.list-1.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-5.list.list-2.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-5.list.list-2.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-5.list.list-3.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-5.list.list-3.description'
              )}
            </li>
          </UnorderedList>
        </Stack>
        <Stack spacing={1}>
          <Typography variant='h5' color='gold.dark'>
            {t('modals.termsAndConditions.subheader-5.subtitle')}
          </Typography>
          <Typography variant='baseMd'>
            {t('modals.termsAndConditions.subheader-5.subtitle-description')}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default PendingPhase
