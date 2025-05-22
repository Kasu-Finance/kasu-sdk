import { TableCell, TableRow, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import { PortfolioRewardsType } from '@/hooks/portfolio/usePortfolioRewards'
import getTranslation from '@/hooks/useTranslation'

import DottedDivider from '@/components/atoms/DottedDivider'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type BonusAndRewardTableBodyProps = {
  rewards: PortfolioRewardsType | undefined
  ksuPrice: string
}

const BonusAndRewardTableBody: React.FC<BonusAndRewardTableBodyProps> = ({
  rewards,
  ksuPrice,
}) => {
  const { t } = getTranslation()

  const claimableYieldEarningsBalanceUSD = convertToUSD(
    toBigNumber(rewards?.bonusYieldEarnings.claimableBalance.ksuAmount || '0'),
    toBigNumber(ksuPrice)
  )

  const lifetimeYieldEarningsBalanceUSD = convertToUSD(
    toBigNumber(rewards?.bonusYieldEarnings.lifeTime.ksuAmount || '0'),
    toBigNumber(ksuPrice)
  )

  const lifetimeLaunchBonusUSD = convertToUSD(
    toBigNumber(rewards?.ksuLaunchBonus.lifeTime.ksuAmount || '0'),
    toBigNumber(ksuPrice)
  )

  return (
    <>
      <TableRow>
        <TableCell>
          {rewards?.bonusYieldEarnings.label ??
            t('portfolio.rewards.bonusYieldEarnings')}
        </TableCell>
        <TableCell>
          <Typography variant='baseMdBold' mr='1ch'>
            {formatAmount(
              rewards?.bonusYieldEarnings.claimableBalance.ksuAmount || '0',
              {
                minValue: 1_000_000,
                minDecimals: 2,
              }
            )}{' '}
            KASU
          </Typography>
          <Typography variant='baseMd' color='gray.middle'>
            {formatAmount(formatEther(claimableYieldEarningsBalanceUSD), {
              minValue: 1_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant='baseMdBold' mr='1ch'>
            {formatAmount(
              rewards?.bonusYieldEarnings.lifeTime.ksuAmount || '0',
              {
                minValue: 1_000_000,
                minDecimals: 2,
              }
            )}{' '}
            KASU
          </Typography>
          <Typography variant='baseMd' color='gray.middle'>
            {formatAmount(formatEther(lifetimeYieldEarningsBalanceUSD), {
              minValue: 1_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={3} sx={{ py: 0 }}>
          <DottedDivider />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          {rewards?.protocolFees.label ?? t('portfolio.rewards.protocolFees')}
        </TableCell>
        <TableCell>
          {formatAmount(
            rewards?.protocolFees.claimableBalance.usdcAmount || '0',
            {
              minValue: 1_000_000,
              minDecimals: 2,
            }
          )}{' '}
          USDC
        </TableCell>
        <TableCell>
          {formatAmount(rewards?.protocolFees.lifeTime.usdcAmount || '0', {
            minValue: 1_000_000,
            minDecimals: 2,
          })}{' '}
          USDC
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={3} sx={{ py: 0 }}>
          <DottedDivider />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          {rewards?.ksuLaunchBonus.label ??
            t('portfolio.rewards.ksuLaunchBonus')}
        </TableCell>
        <TableCell>-</TableCell>
        <TableCell>
          <Typography variant='baseMdBold' mr='1ch'>
            {formatAmount(rewards?.ksuLaunchBonus.lifeTime.ksuAmount || '0', {
              minValue: 1_000_000,
              minDecimals: 2,
            })}{' '}
            KASU
          </Typography>
          <Typography variant='baseMd' color='gray.middle'>
            {formatAmount(formatEther(lifetimeLaunchBonusUSD), {
              minValue: 1_000_000,
              minDecimals: 2,
            })}{' '}
            USDC
          </Typography>
        </TableCell>
      </TableRow>
    </>
  )
}

export default BonusAndRewardTableBody
