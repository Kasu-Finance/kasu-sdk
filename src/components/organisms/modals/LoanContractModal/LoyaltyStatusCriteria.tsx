import { Box, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'
import MultiplierTable from '@/components/organisms/modals/LoanContractModal/MultiplierTable'

import { customTypography } from '@/themes/typography'

type LoyaltyStatusCriteriaProps = {
  formattedText: ExemptLoanContract | RetailLoanContract | undefined
}

const LoyaltyStatusCriteria: React.FC<LoyaltyStatusCriteriaProps> = ({
  formattedText,
}) => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='h4'>
        {formattedText?.['subheader-4'].title ??
          t('modals.loanContract.subheader-4.title')}
      </Typography>
      <Stack spacing={4}>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {formattedText?.['subheader-4']['subheader-4-1'].title ??
              t('modals.loanContract.subheader-4.subheader-4-1.title')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-1']['description-1'] ??
              t('modals.loanContract.subheader-4.subheader-4-1.description-1')}
          </Typography>
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {formattedText?.['subheader-4']['subheader-4-1']['list-0'][
                'list-1'
              ] ??
                t(
                  'modals.loanContract.subheader-4.subheader-4-1.list-0.list-1'
                )}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-1']['list-0'][
                'list-2'
              ] ??
                t(
                  'modals.loanContract.subheader-4.subheader-4-1.list-0.list-2'
                )}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-1']['list-0'][
                'list-3'
              ] ??
                t(
                  'modals.loanContract.subheader-4.subheader-4-1.list-0.list-3'
                )}
            </li>
          </UnorderedList>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-1']['description-2'] ??
              t('modals.loanContract.subheader-4.subheader-4-1.description-2')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-1']['description-3'] ??
              t('modals.loanContract.subheader-4.subheader-4-1.description-3')}
          </Typography>
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {formattedText?.['subheader-4']['subheader-4-1']['list-1'][
                'list-1'
              ] ??
                t(
                  'modals.loanContract.subheader-4.subheader-4-1.list-1.list-1'
                )}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-1']['list-1'][
                'list-2'
              ] ??
                t(
                  'modals.loanContract.subheader-4.subheader-4-1.list-1.list-2'
                )}
            </li>
          </UnorderedList>
          <MultiplierTable />
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-1']['description-4'] ??
              t('modals.loanContract.subheader-4.subheader-4-1.description-4')}
          </Typography>
        </Stack>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {formattedText?.['subheader-4']['subheader-4-2'].title ??
              t('modals.loanContract.subheader-4.subheader-4-2.title')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-2']['description-1'] ??
              t('modals.loanContract.subheader-4.subheader-4-2.description-1')}
          </Typography>
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {formattedText?.['subheader-4']['subheader-4-2'].list['list-0'] ??
                t('modals.loanContract.subheader-4.subheader-4-2.list.list-0')}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-2'].list['list-1'] ??
                t('modals.loanContract.subheader-4.subheader-4-2.list.list-1')}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-2'].list['list-2'] ??
                t('modals.loanContract.subheader-4.subheader-4-2.list.list-2')}
            </li>
          </UnorderedList>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-2']['description-2'] ??
              t('modals.loanContract.subheader-4.subheader-4-2.description-2')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-2']['description-3'] ??
              t('modals.loanContract.subheader-4.subheader-4-2.description-3')}
          </Typography>
          <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
            <Typography variant='baseMdBold'>
              {formattedText?.['subheader-4']['subheader-4-2']['example-1'] ??
                t('modals.loanContract.subheader-4.subheader-4-2.example-1')}
            </Typography>
          </Box>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-2']['description-4'] ??
              t('modals.loanContract.subheader-4.subheader-4-2.description-4')}
          </Typography>
          <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
            <Typography variant='baseMdBold'>
              {formattedText?.['subheader-4']['subheader-4-2']['example-2'] ??
                t('modals.loanContract.subheader-4.subheader-4-2.example-2')}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={3}>
          <Typography variant='h6'>
            {formattedText?.['subheader-4']['subheader-4-3'].title ??
              t('modals.loanContract.subheader-4.subheader-4-3.title')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-3']['description-1'] ??
              t('modals.loanContract.subheader-4.subheader-4-3.description-1')}
          </Typography>
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {formattedText?.['subheader-4']['subheader-4-3'].list['list-0'] ??
                t('modals.loanContract.subheader-4.subheader-4-3.list.list-0')}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-3'].list['list-1'] ??
                t('modals.loanContract.subheader-4.subheader-4-3.list.list-1')}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-3'].list['list-2'] ??
                t('modals.loanContract.subheader-4.subheader-4-3.list.list-2')}
            </li>
          </UnorderedList>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-3']['description-2'] ??
              t('modals.loanContract.subheader-4.subheader-4-3.description-2')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-3']['description-3'] ??
              t('modals.loanContract.subheader-4.subheader-4-3.description-3')}
          </Typography>
          <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
            <Typography variant='baseMdBold'>
              {formattedText?.['subheader-4']['subheader-4-3']['example-1'] ??
                t('modals.loanContract.subheader-4.subheader-4-3.example-1')}
            </Typography>
          </Box>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-3']['description-4'] ??
              t('modals.loanContract.subheader-4.subheader-4-3.description-4')}
          </Typography>
          <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
            <Typography variant='baseMdBold'>
              {formattedText?.['subheader-4']['subheader-4-3']['example-2'] ??
                t('modals.loanContract.subheader-4.subheader-4-3.example-2')}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={3}>
          <Typography variant='h6'>
            {formattedText?.['subheader-4']['subheader-4-4'].title ??
              t('modals.loanContract.subheader-4.subheader-4-4.title')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-4']['description-1'] ??
              t('modals.loanContract.subheader-4.subheader-4-4.description-1')}
          </Typography>{' '}
          <UnorderedList
            sx={{ ...customTypography.baseSm, pl: 2, 'li + li': { mt: 0.5 } }}
          >
            <li>
              {formattedText?.['subheader-4']['subheader-4-4'].list['list-0'] ??
                t('modals.loanContract.subheader-4.subheader-4-4.list.list-0')}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-4'].list['list-1'] ??
                t('modals.loanContract.subheader-4.subheader-4-4.list.list-1')}
            </li>
            <li>
              {formattedText?.['subheader-4']['subheader-4-4'].list['list-2'] ??
                t('modals.loanContract.subheader-4.subheader-4-4.list.list-2')}
            </li>
          </UnorderedList>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-4']['description-2'] ??
              t('modals.loanContract.subheader-4.subheader-4-4.description-2')}
          </Typography>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-4']['description-3'] ??
              t('modals.loanContract.subheader-4.subheader-4-4.description-3')}
          </Typography>
          <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
            <Typography variant='baseMdBold'>
              {formattedText?.['subheader-4']['subheader-4-4']['example-1'] ??
                t('modals.loanContract.subheader-4.subheader-4-4.example-1')}
            </Typography>
          </Box>
          <Typography variant='baseSm'>
            {formattedText?.['subheader-4']['subheader-4-4']['description-4'] ??
              t('modals.loanContract.subheader-4.subheader-4-4.description-4')}
          </Typography>
          <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
            <Typography variant='baseMdBold'>
              {formattedText?.['subheader-4']['subheader-4-4']['example-2'] ??
                t('modals.loanContract.subheader-4.subheader-4-4.example-2')}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  )
}
export default LoyaltyStatusCriteria
