import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'

const MultiplierTable = () => {
  const { t } = getTranslation()

  return (
    <Table size='small'>
      <TableHead>
        <TableRow
          sx={{
            '.MuiTableCell-root': {
              ...customTypography.baseMdBold,
              borderColor: customPalette.gray.extraDark,
            },
          }}
        >
          <TableCell sx={{ pl: 0 }}>
            <b>{t('locking.widgets.rKsuMultiplier.tableHeaders.cell-1')}</b>
          </TableCell>
          <TableCell align='right' sx={{ pr: 0 }}>
            <b>{t('locking.widgets.rKsuMultiplier.tableHeaders.cell-2')}</b>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody
        sx={{
          '.MuiTableCell-root': {
            border: 'none',

            '&:not(.border)': {
              py: 2,
              '&:first-child': {
                pl: 0,
                ...customTypography.baseMd,
              },
              '&:last-child': {
                pr: 0,
                ...customTypography.baseMdBold,
              },
            },
          },
        }}
      >
        <TableRow>
          <TableCell>30 days</TableCell>
          <TableCell align='right'>0.05x multiplier (5%)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} padding='none' className='border'>
            <DottedDivider color='white' />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>180 days</TableCell>
          <TableCell align='right'>0.25x multiplier (25%)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} padding='none' className='border'>
            <DottedDivider color='white' />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>360 days</TableCell>
          <TableCell align='right'>0.50x multiplier (50%)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} padding='none' className='border'>
            <DottedDivider color='white' />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>720 days</TableCell>
          <TableCell align='right'>1.00x multiplier (100%)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={2} padding='none' className='border'>
            <DottedDivider color='white' />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default MultiplierTable
