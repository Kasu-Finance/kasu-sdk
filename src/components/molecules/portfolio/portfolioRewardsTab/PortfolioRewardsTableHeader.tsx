import { alpha, TableCell, TableRow } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import { Sort } from '@/components/molecules/CustomTable'
import CustomTableSortLabel from '@/components/molecules/CustomTable/CustomTableSortLabel'
import { PORTFOLIO_REWARDS_KEY } from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardsTable'

type PortfolioRewardsTableHeaderProps = {
  handleSortChange: (newKey: (typeof PORTFOLIO_REWARDS_KEY)[number]) => void
  sort: Sort<typeof PORTFOLIO_REWARDS_KEY>
}

const PortfolioRewardsTableHeader: React.FC<
  PortfolioRewardsTableHeaderProps
> = ({ handleSortChange, sort }) => {
  const { t } = useTranslation()

  return (
    <>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <TableCell width='50%' rowSpan={2} />
        <TableCell align='center' colSpan={2}>
          {t('general.rewards')}
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <TableCell align='right'>
          <CustomTableSortLabel
            label={t('general.lastEpoch')}
            handleSortChange={handleSortChange}
            sort={sort}
            sortKey='lastEpoch'
            flipIcon
          />
        </TableCell>
        <TableCell align='right'>
          <CustomTableSortLabel
            label={t('general.lifetime')}
            handleSortChange={handleSortChange}
            sort={sort}
            sortKey='lifetime'
            flipIcon
          />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PortfolioRewardsTableHeader
