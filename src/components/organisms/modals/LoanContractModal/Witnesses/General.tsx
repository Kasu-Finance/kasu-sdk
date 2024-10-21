import { Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

const General = () => {
  const { t } = useTranslation()

  return (
    <li>
      {t('modals.loanContract.subheader-3.list.list-7.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {t('modals.loanContract.subheader-3.list.list-7.list-7-1-list.title')}
          <Typography variant='baseSm' display='block' mt={1}>
            {t(
              'modals.loanContract.subheader-3.list.list-7.list-7-1-list.description'
            )}
          </Typography>

          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-7.list-7-1-list.list-7-1-list-0.list-0'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-7.list-7-1-list.list-7-1-list-0.list-1'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-7.list-7-1-list.list-7-1-list-0.list-2'
              )}
            </li>
          </OrderedList>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-7.list-7-2-list.title')}
          <Typography variant='baseSm' display='block' mt={1}>
            {t(
              'modals.loanContract.subheader-3.list.list-7.list-7-2-list.description'
            )}
          </Typography>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-7.list-7-3-list.title')}
          <Typography variant='baseSm' display='block' mt={1}>
            {t(
              'modals.loanContract.subheader-3.list.list-7.list-7-3-list.description'
            )}
          </Typography>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-7.list-7-4-list.title')}
          <Typography variant='baseSm' display='block' mt={1}>
            {t(
              'modals.loanContract.subheader-3.list.list-7.list-7-4-list.description'
            )}
          </Typography>
        </li>
      </OrderedList>
    </li>
  )
}

export default General
