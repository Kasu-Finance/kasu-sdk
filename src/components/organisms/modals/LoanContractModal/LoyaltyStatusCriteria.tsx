import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'

import { customTypography } from '@/themes/typography'

const LoyaltyStatusCriteria = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='h4'>
        {t('modals.loanContract.subheader-4.title')}
      </Typography>
      <Stack spacing={4}>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {t('modals.loanContract.subheader-4.subheader-4-1.title')}
          </Typography>
          <Typography variant='baseSm'>
            {t('modals.loanContract.subheader-4.subheader-4-1.description')}
          </Typography>
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-1.list.list-0')}
            </li>
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-1.list.list-1')}
            </li>
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-1.list.list-2')}
            </li>
          </UnorderedList>
        </Stack>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {t('modals.loanContract.subheader-4.subheader-4-2.title')}
          </Typography>
          <Typography variant='baseSm'>
            {t('modals.loanContract.subheader-4.subheader-4-2.description')}
          </Typography>
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-2.list.list-0')}
            </li>
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-2.list.list-1')}
            </li>
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-2.list.list-2')}
            </li>
          </UnorderedList>
        </Stack>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {t('modals.loanContract.subheader-4.subheader-4-3.title')}
          </Typography>
          <Typography variant='baseSm'>
            {t('modals.loanContract.subheader-4.subheader-4-3.description')}
          </Typography>
        </Stack>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {t('modals.loanContract.subheader-4.subheader-4-4.title')}
          </Typography>
          <Typography variant='baseSm'>
            {t('modals.loanContract.subheader-4.subheader-4-4.description')}
          </Typography>{' '}
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-4.list.list-0')}
            </li>
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-4.list.list-1')}
            </li>
            <li>
              {t('modals.loanContract.subheader-4.subheader-4-4.list.list-2')}
            </li>
          </UnorderedList>
        </Stack>
      </Stack>
    </Stack>
  )
}
export default LoyaltyStatusCriteria
