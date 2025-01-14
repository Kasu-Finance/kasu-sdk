import { Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type WithdrawalRightsProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const WithdrawalRights: React.FC<WithdrawalRightsProps> = ({
  formattedText,
  isExempt,
}) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-5'].title ??
        t('modals.loanContract.subheader-3.list.list-5.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-5']['list-5-1-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-5.list-5-1-list.title'
            )}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-1-list'][
                'list-5-1-list-0'
              ]['list-0'] ??
                t(
                  'modals.loanContract.subheader-3.list.list-5.list-5-1-list.list-5-1-list-0.list-0'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-1-list'][
                'list-5-1-list-0'
              ]['list-1'] ??
                t(
                  'modals.loanContract.subheader-3.list.list-5.list-5-1-list.list-5-1-list-0.list-1'
                )}
            </li>
          </OrderedList>
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-5']['list-5-2-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-5.list-5-2-list.title'
            )}
          <Typography variant='baseSm' display='block' mt={1}>
            {formattedText?.['subheader-3'].list['list-5']['list-5-2-list']
              .description ??
              t(
                `modals.loanContract.subheader-3.list.list-5.list-5-2-list.description.${isExempt ? 'exempt' : 'retail'}`
              )}
          </Typography>
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-2-list'][
                'list-5-2-list-0'
              ]['list-0'] ??
                t(
                  'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-0'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-2-list'][
                'list-5-2-list-0'
              ]['list-1'].title ??
                t(
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
                  {formattedText?.['subheader-3'].list['list-5'][
                    'list-5-2-list'
                  ]['list-5-2-list-0']['list-1']['list-5-2-list-0-list-1-list'][
                    'list-0'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-1.list-5-2-list-0-list-1-list.list-0'
                    )}
                </li>
                <li>
                  {formattedText?.['subheader-3'].list['list-5'][
                    'list-5-2-list'
                  ]['list-5-2-list-0']['list-1']['list-5-2-list-0-list-1-list'][
                    'list-1'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-1.list-5-2-list-0-list-1-list.list-1'
                    )}
                </li>
              </OrderedList>
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-2-list'][
                'list-5-2-list-0'
              ]['list-2'].title ??
                t(
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
                  {formattedText?.['subheader-3'].list['list-5'][
                    'list-5-2-list'
                  ]['list-5-2-list-0']['list-2']['list-5-2-list-0-list-2-list'][
                    'list-0'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-2.list-5-2-list-0-list-2-list.list-0'
                    )}
                </li>
                <li>
                  {formattedText?.['subheader-3'].list['list-5'][
                    'list-5-2-list'
                  ]['list-5-2-list-0']['list-2']['list-5-2-list-0-list-2-list'][
                    'list-1'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-5.list-5-2-list.list-5-2-list-0.list-2.list-5-2-list-0-list-2-list.list-1'
                    )}
                </li>
              </OrderedList>
            </li>
          </OrderedList>
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-5']['list-5-3-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-5.list-5-3-list.title'
            )}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-3-list'][
                'list-5-3-list-0'
              ].title ??
                t(
                  'modals.loanContract.subheader-3.list.list-5.list-5-3-list.list-5-3-list-0.title'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-3-list'][
                'list-5-3-list-1'
              ].title ??
                t(
                  'modals.loanContract.subheader-3.list.list-5.list-5-3-list.list-5-3-list-1.title'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-5']['list-5-3-list'][
                'list-5-3-list-2'
              ].title ??
                t(
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
