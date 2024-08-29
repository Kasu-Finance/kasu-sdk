import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const PoolCreditMetricsTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell>{t('risk.poolCredit.headers.column-1')}</TableCell>
      <TableCell>{t('risk.poolCredit.headers.column-2')}</TableCell>
      <TableCell>{t('risk.poolCredit.headers.column-3')}</TableCell>
      <TableCell>{t('risk.poolCredit.headers.column-4')}</TableCell>
    </TableRow>
  )
}

export default PoolCreditMetricsTableHeader
