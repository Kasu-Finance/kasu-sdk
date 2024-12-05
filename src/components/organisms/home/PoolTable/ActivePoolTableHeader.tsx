import { TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import GrossApyTooltip from '@/components/molecules/tooltips/GrossApyTooltip'
import PoolTableHeaderCell from '@/components/organisms/home/PoolTable/PoolTableHeaderCell'

const ActivePoolTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <PoolTableHeaderCell label={t('general.lendingStrategy')} width='30%' />
      <PoolTableHeaderCell
        label={t('general.grossApy')}
        toolTip={<GrossApyTooltip />}
        width='12%'
      />
      <PoolTableHeaderCell
        label={
          <>
            {t('home.activePools.table.loanFunds.part-1')} <br />
            {t('home.activePools.table.loanFunds.part-2')}
          </>
        }
        toolTip={t('details.poolDelegate.totalFunds.tooltip')}
        width='14%'
      />
      <PoolTableHeaderCell
        label={t('details.poolDelegate.history.label')}
        toolTip={t('details.poolDelegate.history.tooltip')}
        width='14%'
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
