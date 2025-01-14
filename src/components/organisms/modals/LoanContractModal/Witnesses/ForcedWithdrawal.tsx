import { Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

type ForcedWithdrawalProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const ForcedWithdrawal: React.FC<ForcedWithdrawalProps> = ({
  formattedText,
}) => {
  const { t } = getTranslation()

  return (
    <li>
      {formattedText?.['subheader-3'].list['list-6'].title ??
        t('modals.loanContract.subheader-3.list.list-6.title')}
      <Typography variant='baseSm' display='block' mt={1}>
        {formattedText?.['subheader-3'].list['list-6'].description ??
          t('modals.loanContract.subheader-3.list.list-6.description')}
      </Typography>
    </li>
  )
}

export default ForcedWithdrawal
