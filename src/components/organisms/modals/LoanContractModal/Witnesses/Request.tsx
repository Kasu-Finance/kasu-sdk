import useTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

const Request = () => {
  const { t } = useTranslation()

  return (
    <li>
      {t('modals.loanContract.subheader-3.list.list-1.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {t('modals.loanContract.subheader-3.list.list-1.list-1-1-list.title')}
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-1.list-1-2-list.title')}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-1.list-1-2-list.list-1-2-list-0.list-0'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-1.list-1-2-list.list-1-2-list-0.list-1'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-1.list-1-2-list.list-1-2-list-0.list-2'
              )}
            </li>
          </OrderedList>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-1.list-1-3-list.title')}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-1.list-1-3-list.list-1-3-list-0.list-0'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-1.list-1-3-list.list-1-3-list-0.list-1'
              )}
            </li>
          </OrderedList>
        </li>
      </OrderedList>
    </li>
  )
}

export default Request
