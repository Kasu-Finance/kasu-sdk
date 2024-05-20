import { alpha, TableCell, TableRow, Typography } from '@mui/material'
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
          <Typography variant='subtitle2'>{t('general.rewards')}</Typography>
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
            variant='caption'
          />
        </TableCell>
        <TableCell align='right'>
          <CustomTableSortLabel
            label={t('general.lifetime')}
            handleSortChange={handleSortChange}
            sort={sort}
            sortKey='lifeTime'
            flipIcon
            variant='caption'
          />
        </TableCell>
      </TableRow>
    </>
  )
}

export default PortfolioRewardsTableHeader
