import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'
import ApplicationLoanAmount from '@/components/organisms/modals/LoanContractModal/Witnesses/ApplicationLoanAmount'
import DefinitionsAndInterpration from '@/components/organisms/modals/LoanContractModal/Witnesses/DefinitionsAndInterpration'
import ForcedWithdrawal from '@/components/organisms/modals/LoanContractModal/Witnesses/ForcedWithdrawal'
import General from '@/components/organisms/modals/LoanContractModal/Witnesses/General'
import ImmediateWithdrawal from '@/components/organisms/modals/LoanContractModal/Witnesses/ImmediateWithdrawal'
import Interest from '@/components/organisms/modals/LoanContractModal/Witnesses/Interest'
import ProvisionLoanAmount from '@/components/organisms/modals/LoanContractModal/Witnesses/ProvisionLoanAmount'
import RepresentationAndWarranties from '@/components/organisms/modals/LoanContractModal/Witnesses/RepresentationAndWarranties'
import Request from '@/components/organisms/modals/LoanContractModal/Witnesses/Request'
import WithdrawalRights from '@/components/organisms/modals/LoanContractModal/Witnesses/WithdrawalRights'

import { customTypography } from '@/themes/typography'

type WitnessesProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
  isExempt: boolean
}

const Witnesses: React.FC<WitnessesProps> = ({ formattedText, isExempt }) => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {formattedText?.['subheader-3'].title ??
          t('modals.loanContract.subheader-3.title')}
      </Typography>
      <OrderedList
        sx={{
          ...customTypography.baseSmBold,
          pl: 0,
          listStyleType: 'none',
          counterReset: 'item',
          ol: {
            pl: 0,
            listStyleType: 'none',
            counterReset: 'item',
          },
          '& > li, ol > li': {
            display: 'table',
            counterIncrement: 'item',
            mb: 1,

            '&::before': {
              content: 'counters(item, ".") ". "',
              display: 'table-cell',
              pr: 1,
            },
          },

          'li ol > li': {
            m: 0,
            mt: 1,
            ...customTypography.baseSm,
            '&::before': {
              content: 'counters(item, ".") ". "',
              ml: -2,
              mr: 0.8,
            },
          },
        }}
      >
        <DefinitionsAndInterpration
          isExempt={isExempt}
          formattedText={formattedText}
        />
        <Request isExempt={isExempt} formattedText={formattedText} />
        <ProvisionLoanAmount
          isExempt={isExempt}
          formattedText={formattedText}
        />
        <Interest isExempt={isExempt} formattedText={formattedText} />
        <ApplicationLoanAmount
          isExempt={isExempt}
          formattedText={formattedText}
        />
        <WithdrawalRights isExempt={isExempt} formattedText={formattedText} />
        <ForcedWithdrawal formattedText={formattedText} />
        <ImmediateWithdrawal formattedText={formattedText} />
        <RepresentationAndWarranties formattedText={formattedText} />
        <General isExempt={isExempt} formattedText={formattedText} />
      </OrderedList>
    </Stack>
  )
}

export default Witnesses
