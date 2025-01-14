import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type ProvisionLoanAmountProps = {
  isExempt: boolean
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const ProvisionLoanAmount: React.FC<ProvisionLoanAmountProps> = ({
  formattedText,
  isExempt,
}) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-2'].title ??
        t('modals.loanContract.subheader-3.list.list-2.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-2']['list-2-1-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-2.list-2-1-list.title'
            )}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {formattedText?.['subheader-3'].list['list-2']['list-2-1-list'][
                'list-2-1-list-0'
              ]['list-0'] ??
                t(
                  'modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-0'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-2']['list-2-1-list'][
                'list-2-1-list-0'
              ]['list-1'].title ??
                t(
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
                  {formattedText?.['subheader-3'].list['list-2'][
                    'list-2-1-list'
                  ]['list-2-1-list-0']['list-1']['list-2-1-list-0-list-1-list'][
                    'list-0'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-1.list-2-1-list-0-list-1-list.list-0'
                    )}
                </li>
                <li>
                  {formattedText?.['subheader-3'].list['list-2'][
                    'list-2-1-list'
                  ]['list-2-1-list-0']['list-1']['list-2-1-list-0-list-1-list'][
                    'list-1'
                  ] ??
                    t(
                      `modals.loanContract.subheader-3.list.list-2.list-2-1-list.list-2-1-list-0.list-1.list-2-1-list-0-list-1-list.list-1.${isExempt ? 'exempt' : 'retail'}`
                    )}
                </li>
              </OrderedList>
            </li>
          </OrderedList>
        </li>
        {isExempt && (
          <li>
            {formattedText &&
            'list-2-4-list' in formattedText['subheader-3'].list['list-2']
              ? formattedText['subheader-3'].list['list-2']['list-2-4-list']
                  .title
              : t(
                  'modals.loanContract.subheader-3.list.list-2.list-2-4-list.title'
                )}
          </li>
        )}
        <li>
          {formattedText?.['subheader-3'].list['list-2']['list-2-2-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-2.list-2-2-list.title'
            )}
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-2']['list-2-3-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-2.list-2-3-list.title'
            )}
        </li>
      </OrderedList>
    </li>
  )
}

export default ProvisionLoanAmount
