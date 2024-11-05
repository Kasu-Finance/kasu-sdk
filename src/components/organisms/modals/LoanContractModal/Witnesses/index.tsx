import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import OrderedList from '@/components/atoms/OrderedList'
import ApplicationLoanAmount from '@/components/organisms/modals/LoanContractModal/Witnesses/ApplicationLoanAmount'
import DefinitionsAndInterpration from '@/components/organisms/modals/LoanContractModal/Witnesses/DefinitionsAndInterpration'
import General from '@/components/organisms/modals/LoanContractModal/Witnesses/General'
import Interest from '@/components/organisms/modals/LoanContractModal/Witnesses/Interest'
import ProvisionLoanAmount from '@/components/organisms/modals/LoanContractModal/Witnesses/ProvisionLoanAmount'
import RepresentationAndWarranties from '@/components/organisms/modals/LoanContractModal/Witnesses/RepresentationAndWarranties'
import Request from '@/components/organisms/modals/LoanContractModal/Witnesses/Request'
import WithdrawalRights from '@/components/organisms/modals/LoanContractModal/Witnesses/WithdrawalRights'

import { customTypography } from '@/themes/typography'

const Witnesses = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>
        {t('modals.loanContract.subheader-3.title')}
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
        <DefinitionsAndInterpration />
        <Request />
        <ProvisionLoanAmount />
        <Interest />
        <ApplicationLoanAmount />
        <WithdrawalRights />
        <RepresentationAndWarranties />
        <General />
      </OrderedList>
    </Stack>
  )
}

export default Witnesses
