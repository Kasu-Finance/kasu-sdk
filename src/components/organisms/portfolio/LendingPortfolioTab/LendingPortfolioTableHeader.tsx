import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const LendingPortfolioTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell sx={{ textTransform: 'capitalize' }} width='30%'>
        {t('general.lendingStrategy')}
      </TableCell>
      <TableCell width='8%'>{t('general.apy')}</TableCell>
      <TableCell width='20%'>
        {t('portfolio.lendingPortfolio.lendingBalance')}
      </TableCell>
      <TableCell width='22%' sx={{ textTransform: 'capitalize' }}>
        {t('portfolio.summary.yieldEarnings.title')} - {t('general.lastEpoch')}
      </TableCell>
      <TableCell width='20%' sx={{ textTransform: 'capitalize' }}>
        {t('general.lifetime')} {t('portfolio.summary.yieldEarnings.title')}
      </TableCell>
    </TableRow>
  )
}

export default LendingPortfolioTableHeader
