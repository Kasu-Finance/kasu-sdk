import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type RequestProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const Request: React.FC<RequestProps> = ({ formattedText, isExempt }) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-1'].title ??
        t('modals.loanContract.subheader-3.list.list-1.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-1']['list-1-1-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-1.list-1-1-list.title'
            )}
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-1']['list-1-2-list']
            .title ??
            t(
              `modals.loanContract.subheader-3.list.list-1.list-1-2-list.title.${isExempt ? 'exempt' : 'retail'}`
            )}
          {!isExempt && (
            <OrderedList sx={{ pl: 1.5 }}>
              <li>
                {formattedText &&
                'list-1-2-list-0' in
                  formattedText['subheader-3'].list['list-1']['list-1-2-list']
                  ? formattedText['subheader-3'].list['list-1'][
                      'list-1-2-list'
                    ]['list-1-2-list-0']['list-0']
                  : t(
                      'modals.loanContract.subheader-3.list.list-1.list-1-2-list.list-1-2-list-0.list-0'
                    )}
              </li>
              <li>
                {formattedText &&
                'list-1-2-list-0' in
                  formattedText['subheader-3'].list['list-1']['list-1-2-list']
                  ? formattedText['subheader-3'].list['list-1'][
                      'list-1-2-list'
                    ]['list-1-2-list-0']['list-1']
                  : t(
                      'modals.loanContract.subheader-3.list.list-1.list-1-2-list.list-1-2-list-0.list-1'
                    )}
              </li>
              <li>
                {formattedText &&
                'list-1-2-list-0' in
                  formattedText['subheader-3'].list['list-1']['list-1-2-list']
                  ? formattedText['subheader-3'].list['list-1'][
                      'list-1-2-list'
                    ]['list-1-2-list-0']['list-2']
                  : t(
                      'modals.loanContract.subheader-3.list.list-1.list-1-2-list.list-1-2-list-0.list-2'
                    )}
              </li>
            </OrderedList>
          )}
        </li>
        {!isExempt && (
          <li>
            {formattedText &&
            'list-1-3-list' in formattedText['subheader-3'].list['list-1']
              ? formattedText['subheader-3'].list['list-1']['list-1-3-list']
                  .title
              : t(
                  'modals.loanContract.subheader-3.list.list-1.list-1-3-list.title'
                )}
            <OrderedList sx={{ pl: 1.5 }}>
              <li>
                {formattedText &&
                'list-1-3-list' in formattedText['subheader-3'].list['list-1']
                  ? formattedText['subheader-3'].list['list-1'][
                      'list-1-3-list'
                    ]['list-1-3-list-0']['list-0']
                  : t(
                      'modals.loanContract.subheader-3.list.list-1.list-1-3-list.list-1-3-list-0.list-0'
                    )}
              </li>
              <li>
                {formattedText &&
                'list-1-3-list' in formattedText['subheader-3'].list['list-1']
                  ? formattedText['subheader-3'].list['list-1'][
                      'list-1-3-list'
                    ]['list-1-3-list-0']['list-1']
                  : t(
                      'modals.loanContract.subheader-3.list.list-1.list-1-3-list.list-1-3-list-0.list-1'
                    )}
              </li>
            </OrderedList>
          </li>
        )}
      </OrderedList>
    </li>
  )
}

export default Request
