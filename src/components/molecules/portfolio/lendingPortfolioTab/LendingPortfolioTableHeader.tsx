import { alpha, Box, TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'

const LendingPortfolioTableHeader = () => {
  const { t } = useTranslation()

  return (
    <>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <TableCell rowSpan={2} width='17%'>
          {t('general.pool')}
        </TableCell>
        <TableCell rowSpan={2} align='right' width='17%' className='apy'>
          {t('general.apy')}
        </TableCell>
        <TableCell rowSpan={2} align='right' width='17%'>
          <Box display='flex' alignItems='center' justifyContent='end'>
            {t('general.investment')}
            <ToolTip title='info' />
          </Box>
        </TableCell>
        <TableCell colSpan={2} align='center' width='48%'>
          {t('portfolio.summary.yieldEarnings.title')}
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <TableCell align='right'>{t('general.lastEpoch')}</TableCell>
        <TableCell align='right'>{t('general.lifetime')}</TableCell>
      </TableRow>
    </>
  )
}

export default LendingPortfolioTableHeader
