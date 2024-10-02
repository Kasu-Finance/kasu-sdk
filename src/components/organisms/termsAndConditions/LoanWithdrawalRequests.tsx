import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'

const LoanWithdrawalRequests = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.termsAndConditions.subheader-6.title')} />
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-6.description')}
        </Typography>
        <Stack spacing={1}>
          <Typography variant='h6'>
            {t('modals.termsAndConditions.subheader-6.list-0.title')}
          </Typography>
          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-6.list-0.list-0.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-6.list-0.list-0.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-6.list-0.list-1.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-6.list-0.list-1.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-6.list-0.list-2.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-6.list-0.list-2.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-6.list-0.list-3.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-6.list-0.list-3.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-6.list-0.list-4.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-6.list-0.list-4.description'
              )}
            </li>
          </UnorderedList>
        </Stack>

        <Stack spacing={1}>
          <Typography variant='h5' color='gold.dark'>
            {t('modals.termsAndConditions.subheader-6.subtitle')}
          </Typography>
          <Typography variant='baseMd'>
            {t('modals.termsAndConditions.subheader-6.subtitle-description')}
          </Typography>
          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>{t('modals.termsAndConditions.subheader-6.list-1.list-0')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-1.list-1')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-1.list-2')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-1.list-3')}</li>
            <li>{t('modals.termsAndConditions.subheader-6.list-1.list-4')}</li>
          </UnorderedList>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default LoanWithdrawalRequests
