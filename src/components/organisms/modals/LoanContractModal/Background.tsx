import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

import { customTypography } from '@/themes/typography'

type BackgroundProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const Background: React.FC<BackgroundProps> = ({ formattedText }) => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {formattedText?.['subheader-2'].title ??
          t('modals.loanContract.subheader-2.title')}
      </Typography>
      <OrderedList
        sx={{
          ...customTypography.baseSm,
          pl: 2,
          'li + li': {
            mt: 1,
          },
        }}
      >
        <li>
          {formattedText?.['subheader-2'].list['list-0'] ??
            t('modals.loanContract.subheader-2.list.list-0')}
        </li>
        <li>
          {formattedText?.['subheader-2'].list['list-1'] ??
            t('modals.loanContract.subheader-2.list.list-1')}
        </li>
      </OrderedList>
    </Stack>
  )
}
export default Background
