import { Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type GeneralProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const General: React.FC<GeneralProps> = ({ formattedText, isExempt }) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-9'].title ??
        t('modals.loanContract.subheader-3.list.list-9.title')}
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-9']['list-9-1-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-9.list-9-1-list.title'
            )}
          <Typography variant='baseSm' display='block' mt={1}>
            {formattedText?.['subheader-3'].list['list-9']['list-9-1-list']
              .description ??
              t(
                'modals.loanContract.subheader-3.list.list-9.list-9-1-list.description'
              )}
          </Typography>

          <OrderedList sx={{ pl: 1.5 }}>
            <li>
              {formattedText?.['subheader-3'].list['list-9']['list-9-1-list'][
                'list-9-1-list-0'
              ]['list-0'] ??
                t(
                  `modals.loanContract.subheader-3.list.list-9.list-9-1-list.list-9-1-list-0.list-0.${isExempt ? 'exempt' : 'retail'}`
                )}
            </li>
            <li>
              {formattedText?.['subheader-3'].list['list-9']['list-9-1-list'][
                'list-9-1-list-0'
              ]['list-1'] ??
                t(
                  `modals.loanContract.subheader-3.list.list-9.list-9-1-list.list-9-1-list-0.list-1.${isExempt ? 'exempt' : 'retail'}`
                )}
            </li>
            {!isExempt && (
              <li>
                {formattedText &&
                'list-2' in
                  formattedText['subheader-3'].list['list-9']['list-9-1-list'][
                    'list-9-1-list-0'
                  ]
                  ? formattedText['subheader-3'].list['list-9'][
                      'list-9-1-list'
                    ]['list-9-1-list-0']['list-2']
                  : t(
                      'modals.loanContract.subheader-3.list.list-9.list-9-1-list.list-9-1-list-0.list-2'
                    )}
              </li>
            )}
          </OrderedList>
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-9']['list-9-2-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-9.list-9-2-list.title'
            )}
          <Typography variant='baseSm' display='block' mt={1}>
            {formattedText?.['subheader-3'].list['list-9']['list-9-2-list']
              .description ??
              t(
                'modals.loanContract.subheader-3.list.list-9.list-9-2-list.description'
              )}
          </Typography>
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-9']['list-9-3-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-9.list-9-3-list.title'
            )}
          <Typography variant='baseSm' display='block' mt={1}>
            {formattedText?.['subheader-3'].list['list-9']['list-9-3-list']
              .description ??
              t(
                'modals.loanContract.subheader-3.list.list-9.list-9-3-list.description'
              )}
          </Typography>
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-9']['list-9-4-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-9.list-9-4-list.title'
            )}
          <Typography variant='baseSm' display='block' mt={1}>
            {formattedText?.['subheader-3'].list['list-9']['list-9-4-list']
              .description ??
              t(
                'modals.loanContract.subheader-3.list.list-9.list-9-4-list.description'
              )}
          </Typography>
        </li>
      </OrderedList>
    </li>
  )
}

export default General
