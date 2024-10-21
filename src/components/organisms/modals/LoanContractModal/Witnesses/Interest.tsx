import useTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

const Interest = () => {
  const { t } = useTranslation()

  return (
    <li>
      {t('modals.loanContract.subheader-3.list.list-3.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {t('modals.loanContract.subheader-3.list.list-3.list-3-1-list.title')}
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-3.list-3-2-list.title')}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-3.list-3-2-list.list-3-2-list-0.list-0'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-3.list-3-2-list.list-3-2-list-0.list-1'
              )}
            </li>
          </OrderedList>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-3.list-3-3-list.title')}
        </li>
      </OrderedList>
    </li>
  )
}

export default Interest
