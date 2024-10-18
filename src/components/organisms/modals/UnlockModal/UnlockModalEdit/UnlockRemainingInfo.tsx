import { Box, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalState from '@/hooks/context/useModalState'
import useRatio from '@/hooks/useRatio'
import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount, toBigNumber } from '@/utils'

const UnlockRemainingInfo = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { userLock } = modal[ModalsKeys.UNLOCK]

  const { amount } = useLockModalState()

  const ratio = useRatio(amount, userLock.lockedAmount)

  const isValidAmount = toBigNumber(amount).lte(
    toBigNumber(userLock.lockedAmount)
  )

  const percentage = isValidAmount
    ? formatAmount(formatEther(ratio.mul(100)) || '0', {
        maxDecimals: 2,
      })
    : '0'

  const remainingRatio = toBigNumber('1').sub(ratio)

  const ksuRemaining = formatEther(
    toBigNumber(userLock.lockedAmount).mul(remainingRatio).div(toBigNumber('1'))
  )

  const rKsuRemaining = formatEther(
    toBigNumber(userLock.rKSUAmount).mul(remainingRatio).div(toBigNumber('1'))
  )

  return (
    <>
      <Box>
        <InfoRow
          title={t('modals.unlock.withdraw.withdraw-metric-1')}
          titleStyle={{ textTransform: 'capitalize' }}
          toolTipInfo={
            <ToolTip
              title={t('modals.unlock.withdraw.withdraw-metric-1-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Typography variant='baseMdBold'>
              {isValidAmount
                ? formatAmount(ksuRemaining || '0')
                : formatAmount(userLock.lockedAmount || '0')}{' '}
              KSU
              <Typography
                variant='baseMd'
                color='rgba(133, 87, 38, 1)'
                ml='1ch'
              >
                {formatAmount(percentage, { minDecimals: 2 })} %
              </Typography>
            </Typography>
          }
          showDivider
          dividerProps={{ color: 'white' }}
        />
        <InfoRow
          title={t('modals.unlock.withdraw.withdraw-metric-2')}
          titleStyle={{ textTransform: 'capitalize' }}
          toolTipInfo={
            <ToolTip
              title={t('modals.unlock.withdraw.withdraw-metric-2-tooltip')}
              iconSx={{
                color: 'gold.extraDark',
                '&:hover': {
                  color: 'rgba(133, 87, 38, 1)',
                },
              }}
            />
          }
          metric={
            <Typography variant='baseMdBold'>
              {isValidAmount
                ? formatAmount(rKsuRemaining || '0')
                : formatAmount(userLock.rKSUAmount || '0')}{' '}
              rKSU
              <Typography
                variant='baseMd'
                color='rgba(133, 87, 38, 1)'
                ml='1ch'
              >
                {formatAmount(percentage, { minDecimals: 2 })} %
              </Typography>
            </Typography>
          }
          showDivider
          dividerProps={{ color: 'white' }}
        />
      </Box>
      <InfoRow
        title={t('modals.unlock.editLock.availableToUnlock.title')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={t('modals.unlock.editLock.availableToUnlock.tooltip')}
            iconSx={{
              color: 'gold.extraDark',
              '&:hover': {
                color: 'rgba(133, 87, 38, 1)',
              },
            }}
          />
        }
        sx={{ pb: 0 }}
        metric={
          <Typography variant='baseMdBold'>
            {formatAmount(userLock.lockedAmount || 0, {
              minDecimals: 2,
            })}{' '}
            KSU
          </Typography>
        }
      />
    </>
  )
}

export default UnlockRemainingInfo
