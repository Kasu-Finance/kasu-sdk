import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

import { customTypography } from '@/themes/typography'

const Background = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {t('modals.loanContract.subheader-2.title')}
      </Typography>
      <OrderedList
        sx={{
          ...customTypography.baseSm,
          pl: 2,
          'li + li': {
            mt: 1,
          },
        }}
      >
        <li>{t('modals.loanContract.subheader-2.list.list-0')}</li>
        <li>{t('modals.loanContract.subheader-2.list.list-1')}</li>
      </OrderedList>
    </Stack>
  )
}
export default Background
