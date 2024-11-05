import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const PoolCreditMetricsTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <TableCell width='35.5%'>
        {t('risk.poolCredit.headers.column-1')}
      </TableCell>
      <TableCell width='21.5%'>
        {t('risk.poolCredit.headers.column-2')}
      </TableCell>
      <TableCell width='21.5%'>
        {t('risk.poolCredit.headers.column-3')}
      </TableCell>
      <TableCell width='21.5%'>
        {t('risk.poolCredit.headers.column-4')}
      </TableCell>
    </TableRow>
  )
}

export default PoolCreditMetricsTableHeader
