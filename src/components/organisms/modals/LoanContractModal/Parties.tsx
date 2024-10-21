import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

import { customTypography } from '@/themes/typography'

const Parties = () => {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant='baseSm'>
        <Typography variant='baseSmBold'>
          {t('modals.loanContract.description-1')}{' '}
        </Typography>
        {t('modals.loanContract.description-2')}
      </Typography>
      <Typography variant='baseSmBold'>
        {t('modals.loanContract.description-3')}
      </Typography>
      <Stack spacing={3}>
        <Typography variant='h4'>
          {t('modals.loanContract.subheader-1.title')}
        </Typography>
        <OrderedList
          sx={{
            ...customTypography.baseSmBold,
            pl: 2,
            'li + li': {
              mt: 1,
            },
          }}
        >
          <li>
            {t('modals.loanContract.subheader-1.list.list-0.description')}{' '}
            <Typography variant='baseSm' component='span'>
              {t('modals.loanContract.subheader-1.list.list-0.label')}
            </Typography>
          </li>
          <li>
            {t('modals.loanContract.subheader-1.list.list-1.description')}{' '}
            <Typography variant='baseSm' component='span'>
              {t('modals.loanContract.subheader-1.list.list-1.label')}
            </Typography>
          </li>
        </OrderedList>
      </Stack>
    </>
  )
}
export default Parties
