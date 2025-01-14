import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type RepresentationAndWarrantiesProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const RepresentationAndWarranties: React.FC<
  RepresentationAndWarrantiesProps
> = ({ formattedText }) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-8'].title ??
        t('modals.loanContract.subheader-3.list.list-8.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-8']['list-8-1-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-8.list-8-1-list.title'
            )}
          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {formattedText?.['subheader-3'].list['list-8']['list-8-1-list'][
                'list-8-1-list-0'
              ]['list-0'].title ??
                t(
                  'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-0.title'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-8']['list-8-1-list'][
                'list-8-1-list-0'
              ]['list-1'].title ??
                t(
                  'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-1.title'
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-8']['list-8-1-list'][
                'list-8-1-list-0'
              ]['list-2'].title ??
                t(
                  'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-2.title'
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
                  {formattedText?.['subheader-3'].list['list-8'][
                    'list-8-1-list'
                  ]['list-8-1-list-0']['list-2']['list-8-1-list-0-list-2-list'][
                    'list-0'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-2.list-8-1-list-0-list-2-list.list-0'
                    )}
                </li>
                <li>
                  {formattedText?.['subheader-3'].list['list-8'][
                    'list-8-1-list'
                  ]['list-8-1-list-0']['list-2']['list-8-1-list-0-list-2-list'][
                    'list-1'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-2.list-8-1-list-0-list-2-list.list-1'
                    )}
                </li>
                <li>
                  {formattedText?.['subheader-3'].list['list-8'][
                    'list-8-1-list'
                  ]['list-8-1-list-0']['list-2']['list-8-1-list-0-list-2-list'][
                    'list-2'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-2.list-8-1-list-0-list-2-list.list-2'
                    )}
                </li>
                <li>
                  {formattedText?.['subheader-3'].list['list-8'][
                    'list-8-1-list'
                  ]['list-8-1-list-0']['list-2']['list-8-1-list-0-list-2-list'][
                    'list-3'
                  ] ??
                    t(
                      'modals.loanContract.subheader-3.list.list-8.list-8-1-list.list-8-1-list-0.list-2.list-8-1-list-0-list-2-list.list-3'
                    )}
                </li>
              </OrderedList>
            </li>
          </OrderedList>
        </li>
      </OrderedList>
    </li>
  )
}

export default RepresentationAndWarranties
