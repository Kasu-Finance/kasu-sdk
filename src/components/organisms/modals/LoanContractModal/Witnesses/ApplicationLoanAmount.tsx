import { Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

const ApplicationLoanAmount = () => {
  const { t } = getTranslation()

  return (
    <li>
      {t('modals.loanContract.subheader-3.list.list-4.title')}
      <Typography variant='baseSm' display='block' mt={1}>
        {t('modals.loanContract.subheader-3.list.list-4.description')}
      </Typography>
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {t('modals.loanContract.subheader-3.list.list-4.list-4-1-list.title')}
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-4.list-4-2-list.title')}
        </li>
      </OrderedList>
    </li>
  )
}

export default ApplicationLoanAmount
