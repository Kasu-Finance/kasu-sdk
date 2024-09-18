import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const FinancialReportingDocumentsTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell width='56%'>{t('risk.reporting.headers.column-1')}</TableCell>
      <TableCell width='19%'>{t('risk.reporting.headers.column-2')}</TableCell>
      <TableCell width='19%'>{t('risk.reporting.headers.column-3')}</TableCell>
      <TableCell width='6%'>{t('risk.reporting.headers.column-4')}</TableCell>
    </TableRow>
  )
}
export default FinancialReportingDocumentsTableHeader
