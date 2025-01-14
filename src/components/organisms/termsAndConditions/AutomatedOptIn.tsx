import { Stack, Typography } from '@mui/material'
import Link from 'next/link'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { Routes } from '@/config/routes'
import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'

const AutomatedOptIn = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.termsAndConditions.subheader-8.title')} />
      <Typography variant='baseMd'>
        {t('modals.termsAndConditions.subheader-8.description-8')}
      </Typography>
      <Typography variant='baseMd'>
        {t('modals.termsAndConditions.subheader-8.description-1')}
      </Typography>
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-8.description-2')}
        </Typography>
        <UnorderedList sx={{ ...customTypography.baseMd }}>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.termsAndConditions.subheader-8.list-1.list-0.title')}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-8.list-1.list-0.description'
            )}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.termsAndConditions.subheader-8.list-1.list-1.title')}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-8.list-1.list-1.description'
            )}
          </li>
          <li>
            <Typography variant='baseMdBold'>
              {t('modals.termsAndConditions.subheader-8.list-1.list-2.title')}
            </Typography>
            {t(
              'modals.termsAndConditions.subheader-8.list-1.list-2.description'
            )}
          </li>
        </UnorderedList>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-8.description-3')}{' '}
          <Typography
            component={Link}
            href={Routes.portfolio.yourTransactions.url}
            variant='baseMd'
            sx={{
              textDecoration: 'none',
              color: customPalette.gold.dark,
            }}
            target='_blank'
          >
            {t('general.myPortfolio')} &gt;{' '}
            {t('portfolio.tabs.yourTransactions')}
          </Typography>{' '}
          {t('modals.termsAndConditions.subheader-8.description-4')}
        </Typography>
      </Stack>
      <Typography variant='baseMd'>
        {t('modals.termsAndConditions.subheader-8.description-5')}
      </Typography>
      <Typography variant='baseMd'>
        {t('modals.termsAndConditions.subheader-8.description-9')}
      </Typography>
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-8.description-6')}{' '}
          <Typography variant='inherit' color='gold.dark' display='inline'>
            no-reply@lenders.kasu.finance
          </Typography>
          . {t('modals.termsAndConditions.subheader-8.description-7')}
        </Typography>
        <Typography variant='h5' color='gold.dark'>
          {t('modals.termsAndConditions.subheader-8.subtitle')}
        </Typography>
      </Stack>
      <Typography variant='baseMd'>
        {t('modals.termsAndConditions.subheader-8.subtitle-description')}{' '}
      </Typography>
    </Stack>
  )
}

export default AutomatedOptIn
