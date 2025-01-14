import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

import { customTypography } from '@/themes/typography'

type PartiesProp = {
  fullName: string | undefined
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const Parties: React.FC<PartiesProp> = ({ fullName, formattedText }) => {
  const { t } = getTranslation()

  return (
    <>
      <Typography variant='baseSm'>
        <Typography variant='baseSmBold'>
          {formattedText?.['description-1'] ??
            t('modals.loanContract.description-1')}{' '}
        </Typography>
        {formattedText?.['description-2'] ??
          t('modals.loanContract.description-2')}
      </Typography>
      <Typography variant='baseSmBold'>
        {formattedText?.['description-3'] ??
          t('modals.loanContract.description-3')}
      </Typography>
      <Stack spacing={3}>
        <Typography variant='h4'>
          {formattedText?.['subheader-1'].title ??
            t('modals.loanContract.subheader-1.title')}
        </Typography>
        <OrderedList
          sx={{
            ...customTypography.baseSmBold,
            pl: 2,
            'li + li': {
              mt: 1,
            },
          }}
        >
          <li>
            {formattedText?.['subheader-1'].list['list-0'].description.replace(
              fullName ? '[Lender’s name]' : '',
              fullName || ''
            ) ??
              t(
                'modals.loanContract.subheader-1.list.list-0.description'
              ).replace(fullName ? '[Lender’s name]' : '', fullName || '')}{' '}
            <Typography variant='baseSm' component='span'>
              {formattedText?.['subheader-1'].list['list-0'].label ??
                t('modals.loanContract.subheader-1.list.list-0.label')}
            </Typography>
          </li>
          <li>
            {formattedText?.['subheader-1'].list['list-1'].description ??
              t('modals.loanContract.subheader-1.list.list-1.description')}{' '}
            <Typography variant='baseSm' component='span'>
              {formattedText?.['subheader-1'].list['list-1'].label ??
                t('modals.loanContract.subheader-1.list.list-1.label')}
            </Typography>
          </li>
        </OrderedList>
      </Stack>
    </>
  )
}
export default Parties
