import { Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'

const WithdrawalRights = () => {
  const { t } = getTranslation()

  return (
    <li>
      {t('modals.loanContract.subheader-3.list.list-5.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {t('modals.loanContract.subheader-3.list.list-5.list-5-1-list.title')}
          <Typography variant='baseSm' display='block' mt={1}>
            {t(
              'modals.loanContract.subheader-3.list.list-5.list-5-1-list.description'
            )}
          </Typography>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-5.list-5-2-list.title')}
          <Typography variant='baseSm' display='block' mt={1}>
            {t(
              'modals.loanContract.subheader-3.list.list-5.list-5-2-list.description'
            )}
          </Typography>
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-0'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-1.title'
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
                    'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-1.list-5-2-list-0-list-1-list.list-0'
                  )}
                </li>
                <li>
                  {t(
                    'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-1.list-5-2-list-0-list-1-list.list-1'
                  )}
                </li>
              </OrderedList>
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-2.title'
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
                    'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-2.list-5-2-list-0-list-2-list.list-0'
                  )}
                </li>
                <li>
                  {t(
                    'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-2.list-5-2-list-0-list-2-list.list-1'
                  )}
                </li>
              </OrderedList>
            </li>
          </OrderedList>
        </li>
        <li>
          {t('modals.loanContract.subheader-3.list.list-5.list-5-3-list.title')}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-5.list-5-3-list.list-5-3-list-0.title'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-5.list-5-3-list.list-5-3-list-1.title'
              )}
            </li>
            <li>
              {t(
                'modals.loanContract.subheader-3.list.list-5.list-5-3-list.list-5-3-list-2.title'
              )}
            </li>
          </OrderedList>
        </li>
      </OrderedList>
    </li>
  )
}

export default WithdrawalRights
