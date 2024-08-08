import { TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import PoolTableHeaderCell from '@/components/organisms/home/PoolTable/PoolTableHeaderCell'

const ClosedPoolTableHeader = () => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <PoolTableHeaderCell label={t('general.lendingStrategy')} width='46%' />
      <PoolTableHeaderCell label={t('general.apy')} width='8%' />
      <PoolTableHeaderCell
        label={t('home.activePools.table.loansUnder')}
        toolTip={t('details.poolTraction.management.tooltip')}
        width='18%'
      />
      <PoolTableHeaderCell
        label={t('home.activePools.table.loanFunds')}
        toolTip={t('details.poolDelegate.totalFunds.tooltip')}
        width='18%'
      />

      <PoolTableHeaderCell
        label={t('home.activePools.table.lossRate')}
        toolTip={t('details.poolDelegate.totalLossRate.tooltip')}
        width='10%'
      />
    </TableRow>
  )
}
export default ClosedPoolTableHeader
