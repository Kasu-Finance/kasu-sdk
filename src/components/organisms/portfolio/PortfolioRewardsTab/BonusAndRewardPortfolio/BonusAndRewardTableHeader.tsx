import { TableCell, TableRow } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const BonusAndRewardTableHeader = () => {
  const { t } = useTranslation()

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
