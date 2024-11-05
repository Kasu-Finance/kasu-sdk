import { TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import PoolTableHeaderCell from '@/components/organisms/home/PoolTable/PoolTableHeaderCell'

const ActivePoolTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <PoolTableHeaderCell label={t('general.lendingStrategy')} width='33%' />
      <PoolTableHeaderCell label={t('general.apy')} width='12%' />
      <PoolTableHeaderCell
        label={t('home.activePools.table.loanFunds')}
        toolTip={t('details.poolDelegate.totalFunds.tooltip')}
        width='13%'
      />
      <PoolTableHeaderCell
        label={t('details.poolDelegate.history.label')}
        toolTip={t('details.poolDelegate.history.tooltip')}
        width='12%'
      />
      <PoolTableHeaderCell
        label={t('home.activePools.table.lossRate')}
        toolTip={t('details.poolDelegate.totalLossRate.tooltip')}
        width='9%'
      />
      <PoolTableHeaderCell
        label={t('lending.poolOverview.detailCard.security.label')}
        toolTip={t('lending.poolOverview.detailCard.security.tooltip')}
        width='21%'
      />
    </TableRow>
  )
}
export default ActivePoolTableHeader
