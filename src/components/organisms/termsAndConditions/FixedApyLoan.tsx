import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'

const FixedApyLoan = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.termsAndConditions.subheader-9.title')} />
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-9.description')}
        </Typography>
        <Stack spacing={1}>
          <Typography variant='h5' color='gold.dark'>
            {t('modals.termsAndConditions.subheader-9.subtitle')}
          </Typography>
          <Typography variant='baseMd'>
            {t('modals.termsAndConditions.subheader-9.subtitle-description')}
          </Typography>

          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-9.list-1.list-0.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-9.list-1.list-0.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-9.list-1.list-1.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-9.list-1.list-1.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-9.list-1.list-2.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-9.list-1.list-2.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-9.list-1.list-3.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-9.list-1.list-3.description'
              )}
            </li>
          </UnorderedList>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default FixedApyLoan
