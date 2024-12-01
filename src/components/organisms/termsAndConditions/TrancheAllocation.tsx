import { Stack, TableCell, TableRow, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import UnorderedList from '@/components/atoms/UnorderedList'
import CustomTable from '@/components/molecules/CustomTable'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

const TrancheAllocation = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.termsAndConditions.subheader-7.title')} />
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-7.description')}
        </Typography>
        <Stack spacing={1}>
          <Typography variant='h6'>
            {t('modals.termsAndConditions.subheader-7.sub-subheader-1')}
          </Typography>
          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-7.list-1.list-0.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-7.list-1.list-0.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-7.list-1.list-1.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-7.list-1.list-1.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-7.list-1.list-2.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-7.list-1.list-2.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-7.list-1.list-3.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-7.list-1.list-3.description'
              )}
            </li>
            <li>
              <Typography variant='baseMdBold'>
                {t('modals.termsAndConditions.subheader-7.list-1.list-4.title')}
              </Typography>
              {t(
                'modals.termsAndConditions.subheader-7.list-1.list-4.description'
              )}
            </li>
          </UnorderedList>
        </Stack>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-7.sub-subheader-2')}
        </Typography>
        <CustomTable
          tableHeader={
            <TableRow>
              <TableCell width='25%'>{t('general.tranche')}</TableCell>
              <TableCell width='25%'>
                {t('modals.termsAndConditions.subheader-7.capacity')}
              </TableCell>
              <TableCell width='25%'>
                {t(
                  'modals.termsAndConditions.subheader-7.totalLendingRequests'
                )}
              </TableCell>
              <TableCell width='25%'>
                {t(
                  'modals.termsAndConditions.subheader-7.excessLendingRequests'
                )}
              </TableCell>
            </TableRow>
          }
          tableBody={
            <>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.junior')}
                </TableCell>
                <TableCell>
                  {formatAmount(50_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(40_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.mezzanine')}
                </TableCell>
                <TableCell>
                  {formatAmount(30_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.senior')}
                </TableCell>
                <TableCell>
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(70_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(50_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
            </>
          }
        />
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-7.description-2')}
        </Typography>
        <CustomTable
          tableHeader={
            <TableRow>
              <TableCell width='25%'>{t('general.tranche')}</TableCell>
              <TableCell width='25%'>
                {t('modals.termsAndConditions.subheader-7.capacity')}
              </TableCell>
              <TableCell width='25%'>
                {t(
                  'modals.termsAndConditions.subheader-7.totalLendingRequests'
                )}
              </TableCell>
              <TableCell width='25%'>
                {t(
                  'modals.termsAndConditions.subheader-7.unallocatedLendingRequests'
                )}
              </TableCell>
            </TableRow>
          }
          tableBody={
            <>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.junior')}
                </TableCell>
                <TableCell>
                  {formatAmount(50_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(40_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(30_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.mezzanine')}
                </TableCell>
                <TableCell>
                  {formatAmount(30_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.senior')}
                </TableCell>
                <TableCell>
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(70_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
            </>
          }
        />
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-7.description-3')}
        </Typography>

        <Stack spacing={1}>
          <Typography variant='h5' color='gold.dark'>
            {t('modals.termsAndConditions.subheader-7.subtitle')}
          </Typography>
          <Typography variant='baseMd'>
            {t('modals.termsAndConditions.subheader-7.subtitle-description')}
          </Typography>
          <UnorderedList sx={{ ...customTypography.baseMd }}>
            <li>{t('modals.termsAndConditions.subheader-7.list-3.list-0')}</li>
            <li>{t('modals.termsAndConditions.subheader-7.list-3.list-1')}</li>
            <li>{t('modals.termsAndConditions.subheader-7.list-3.list-2')}</li>
            <li>{t('modals.termsAndConditions.subheader-7.list-3.list-3')}</li>
            <li>{t('modals.termsAndConditions.subheader-7.list-3.list-4')}</li>
          </UnorderedList>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default TrancheAllocation
