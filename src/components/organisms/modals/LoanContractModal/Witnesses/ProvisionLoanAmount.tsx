import useTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

const ProvisionLoanAmount = () => {
  const { t } = useTranslation()

  return (
    <li>
      {t('modals.loanContract.subheader-3.list.list-2.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {t('modals.loanContract.subheader-3.list.list-2.list-2-1-list.title')}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-0'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-1.title'
              )}
              <OrderedList
                sx={{
                  '& > li': {
                    counterIncrement: 'unset !important',
                    display: 'list-item !important',
                    pl: 1,
                    '&::before': {
                      display: 'none !important',
                    },
                  },
                }}
                style={{
                  listStyleType: 'upper-alpha',
                  counterReset: 'unset',
                  paddingLeft: 16,
                }}
              >
                <li>
                  {t(
                    'modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-1.list-2-1-list-0-list-1-list.list-0'
                  )}
                </li>
                <li>
                  {t(
                    'modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-1.list-2-1-list-0-list-1-list.list-1'
                  )}
                </li>
              </OrderedList>
            </li>
          </OrderedList>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-2.list-2-2-list.title')}
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-2.list-2-3-list.title')}
        </li>
      </OrderedList>
    </li>
  )
}

export default ProvisionLoanAmount
