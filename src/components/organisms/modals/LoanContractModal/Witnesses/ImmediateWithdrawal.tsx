import { Typography } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type ImmediateWithdrawalProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const ImmediateWithdrawal: React.FC<ImmediateWithdrawalProps> = ({
  formattedText,
}) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-7'].title ??
        t('modals.loanContract.subheader-3.list.list-7.title')}
      <Typography variant='baseSm' display='block' mt={1}>
        {formattedText?.['subheader-3'].list['list-7'].description ??
          t('modals.loanContract.subheader-3.list.list-7.description')}
      </Typography>
    </li>
  )
}

export default ImmediateWithdrawal
