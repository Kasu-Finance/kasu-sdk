import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'

const Warning = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={5}>
      <Stack spacing={2}>
        <Subheading title={t('modals.termsAndConditions.subheader-2.title')} />
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-2.description')}
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant='h5' color='gold.dark'>
          1. {t('modals.termsAndConditions.subheader-2.sub-subheader-1.title')}
        </Typography>
        <Typography variant='baseMd'>
          {t(
            'modals.termsAndConditions.subheader-2.sub-subheader-1.description'
          )}
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.keyRisks')}
        </Typography>
        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>
            <Typography variant='baseMdBold'>
              {t(
                'modals.termsAndConditions.subheader-2.sub-subheader-1.list.list-0.title'
              )}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-2.sub-subheader-1.list.list-0.description'
            )}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t(
                'modals.termsAndConditions.subheader-2.sub-subheader-1.list.list-1.title'
              )}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-2.sub-subheader-1.list.list-1.description'
            )}
          </li>
        </UnorderedList>
      </Stack>
      <Stack spacing={1}>
        <Typography variant='h5' color='gold.dark'>
          2. {t('modals.termsAndConditions.subheader-2.sub-subheader-2.title')}
        </Typography>
        <Typography variant='baseMd'>
          {t(
            'modals.termsAndConditions.subheader-2.sub-subheader-2.description'
          )}
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.keyRisks')}
        </Typography>
        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>
            <Typography variant='baseMdBold'>
              {t(
                'modals.termsAndConditions.subheader-2.sub-subheader-2.list.list-0.title'
              )}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-2.sub-subheader-2.list.list-0.description'
            )}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t(
                'modals.termsAndConditions.subheader-2.sub-subheader-2.list.list-1.title'
              )}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-2.sub-subheader-2.list.list-1.description'
            )}
          </li>
        </UnorderedList>
      </Stack>
      <Stack spacing={1}>
        <Typography variant='h5' color='gold.dark'>
          3. {t('modals.termsAndConditions.subheader-2.sub-subheader-3.title')}
        </Typography>
        <Typography variant='baseMd'>
          {t(
            'modals.termsAndConditions.subheader-2.sub-subheader-3.description'
          )}
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.keyRisks')}
        </Typography>
        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>
            <Typography variant='baseMdBold'>
              {t(
                'modals.termsAndConditions.subheader-2.sub-subheader-3.list.list-0.title'
              )}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-2.sub-subheader-3.list.list-0.description'
            )}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t(
                'modals.termsAndConditions.subheader-2.sub-subheader-3.list.list-1.title'
              )}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-2.sub-subheader-3.list.list-1.description'
            )}
          </li>
        </UnorderedList>
      </Stack>

      <Stack spacing={1}>
        <Typography variant='h5' color='gold.dark'>
          {t('modals.termsAndConditions.subheader-2.sub-subheader-4.title')}
        </Typography>
        <Typography variant='baseMd'>
          {t(
            'modals.termsAndConditions.subheader-2.sub-subheader-4.description'
          )}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default Warning
