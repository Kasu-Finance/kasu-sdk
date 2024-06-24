import { alpha, Box, TableCell, TableRow, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

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
          <Typography variant='subtitle2'>
            {t('general.lendingStrategy')}
          </Typography>
        </TableCell>
        <TableCell rowSpan={2} align='right' width='17%' className='apy'>
          <Typography variant='subtitle2'>{t('general.apy')}</Typography>
        </TableCell>
        <TableCell rowSpan={2} align='right' width='17%'>
          <Box display='flex' alignItems='center' justifyContent='end'>
            <Typography variant='subtitle2'>{t('general.lending')}</Typography>
          </Box>
        </TableCell>
        <TableCell colSpan={2} align='center' width='48%'>
          <Typography variant='subtitle2'>
            {t('portfolio.summary.yieldEarnings.title')}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <TableCell align='right'>
          <Typography variant='caption'>{t('general.lastEpoch')}</Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography variant='caption'>{t('general.lifetime')}</Typography>
        </TableCell>
      </TableRow>
    </>
  )
}

export default LendingPortfolioTableHeader
