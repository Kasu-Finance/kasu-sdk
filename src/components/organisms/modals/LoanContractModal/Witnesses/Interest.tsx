import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type InterestProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const Interest: React.FC<InterestProps> = ({ formattedText, isExempt }) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-3'].title ??
        t('modals.loanContract.subheader-3.list.list-3.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-3']['list-3-1-list']
            .title ??
            t(
              `modals.loanContract.subheader-3.list.list-3.list-3-1-list.title.${isExempt ? 'exempt' : 'retail'}`
            )}
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-3']['list-3-2-list']
            .title ??
            t(
              `modals.loanContract.subheader-3.list.list-3.list-3-2-list.title.${isExempt ? 'exempt' : 'retail'}`
            )}
          {!isExempt && (
            <OrderedList sx={{ pl: 1.5 }}>
              <li>
                {formattedText &&
                'list-3-2-list-0' in
                  formattedText['subheader-3'].list['list-3']['list-3-2-list']
                  ? formattedText['subheader-3'].list['list-3'][
                      'list-3-2-list'
                    ]['list-3-2-list-0']['list-0']
                  : t(
                      'modals.loanContract.subheader-3.list.list-3.list-3-2-list.list-3-2-list-0.list-0'
                    )}
              </li>
              <li>
                {formattedText &&
                'list-3-2-list-0' in
                  formattedText['subheader-3'].list['list-3']['list-3-2-list']
                  ? formattedText['subheader-3'].list['list-3'][
                      'list-3-2-list'
                    ]['list-3-2-list-0']['list-1']
                  : t(
                      'modals.loanContract.subheader-3.list.list-3.list-3-2-list.list-3-2-list-0.list-1'
                    )}
              </li>
            </OrderedList>
          )}
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-3']['list-3-3-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-3.list-3-3-list.title'
            )}
        </li>
      </OrderedList>
    </li>
  )
}

export default Interest
