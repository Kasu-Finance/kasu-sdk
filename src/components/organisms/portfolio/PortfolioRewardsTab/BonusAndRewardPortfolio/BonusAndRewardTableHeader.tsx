import { TableCell, TableRow } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const BonusAndRewardTableHeader = () => {
  const { t } = getTranslation()

  return (
    <TableRow>
      <TableCell width='40%'>
        {t('portfolio.rewards.bonusesAndRewards')}
      </TableCell>
      <TableCell width='30%'>
        {t('portfolio.rewards.claimableBalance')}
      </TableCell>
      <TableCell width='30%'>
        {t('portfolio.rewards.lifetimeRewards')}
      </TableCell>
    </TableRow>
  )
}

export default BonusAndRewardTableHeader
