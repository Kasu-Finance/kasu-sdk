import { Stack, TableCell, TableRow, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'
import UnorderedList from '@/components/atoms/UnorderedList'
import CustomTableTest from '@/components/molecules/CustomTableTest'
import Subheading from '@/components/organisms/termsAndConditions/Subheading'

import { customTypography } from '@/themes/typography'
import { formatAmount } from '@/utils'

const TrancheAllocation = () => {
  const { t } = useTranslation()

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
          </UnorderedList>
        </Stack>
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-7.sub-subheader-2')}
        </Typography>
        <CustomTableTest
          tableHeader={
            <TableRow>
              <TableCell width='33.33%'>{t('general.tranche')}</TableCell>
              <TableCell width='33.33%'>
                {t('modals.termsAndConditions.subheader-7.capacity')}
              </TableCell>
              <TableCell width='33.33%'>
                {t(
                  'modals.termsAndConditions.subheader-7.totalLendingRequests'
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
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(70_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0 }}>
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
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.senior')}
                </TableCell>
                <TableCell>
                  {formatAmount(50_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(40_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
            </>
          }
        />
        <Typography variant='h6'>
          {t('modals.termsAndConditions.subheader-7.description-2')}
        </Typography>
        <CustomTableTest
          tableHeader={
            <TableRow>
              <TableCell width='33.33%'>{t('general.tranche')}</TableCell>
              <TableCell width='33.33%'>
                {t('modals.termsAndConditions.subheader-7.capacity')}
              </TableCell>
              <TableCell width='33.33%'>
                {t(
                  'modals.termsAndConditions.subheader-7.totalLendingRequests'
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
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(20_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0 }}>
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
                  {formatAmount(30_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0 }}>
                  <DottedDivider />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('modals.termsAndConditions.subheader-7.senior')}
                </TableCell>
                <TableCell>
                  {formatAmount(50_000, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  {formatAmount(50_000, { minDecimals: 2 })} USDC
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 0 }}>
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
          </UnorderedList>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default TrancheAllocation
