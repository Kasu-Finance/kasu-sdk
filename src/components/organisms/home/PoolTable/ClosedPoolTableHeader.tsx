import { TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import PoolTableHeaderCell from '@/components/organisms/home/PoolTable/PoolTableHeaderCell'

const ClosedPoolTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <PoolTableHeaderCell label={t('general.lendingStrategy')} width='40%' />
      <PoolTableHeaderCell label={t('general.apy')} width='12%' />
      <PoolTableHeaderCell
        label={t('home.activePools.table.loansUnder')}
        toolTip={t('details.poolTraction.management.tooltip')}
        width='18%'
      />
      <PoolTableHeaderCell
        label={
          <>
            {t('home.activePools.table.loanFunds.part-1')}
            <br />
            {t('home.activePools.table.loanFunds.part-2')}
          </>
        }
        toolTip={t('details.poolDelegate.totalFunds.tooltip')}
        width='18%'
      />

      <PoolTableHeaderCell
        label={t('home.activePools.table.lossRate')}
        toolTip={t('details.poolDelegate.totalLossRate.tooltip')}
        width='12%'
      />
    </TableRow>
  )
}
export default ClosedPoolTableHeader
