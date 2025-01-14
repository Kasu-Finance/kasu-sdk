import { Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type ApplicationLoanAmountProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const ApplicationLoanAmount: React.FC<ApplicationLoanAmountProps> = ({
  formattedText,
  isExempt,
}) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-4'].title ??
        t('modals.loanContract.subheader-3.list.list-4.title')}
      <Typography variant='baseSm' display='block' mt={1}>
        {formattedText?.['subheader-3'].list['list-4'].description ??
          t(
            `modals.loanContract.subheader-3.list.list-4.description.${isExempt ? 'exempt' : 'retail'}`
          )}
      </Typography>
      <OrderedList sx={{ pl: 1.5 }}>
        <li>
          {formattedText?.['subheader-3'].list['list-4']['list-4-1-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-4.list-4-1-list.title'
            )}
        </li>
        <li>
          {formattedText?.['subheader-3'].list['list-4']['list-4-2-list']
            .title ??
            t(
              'modals.loanContract.subheader-3.list.list-4.list-4-2-list.title'
            )}
        </li>
      </OrderedList>
    </li>
  )
}

export default ApplicationLoanAmount
