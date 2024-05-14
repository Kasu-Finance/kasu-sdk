import { Box, Grid, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { formatEther } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useRatio from '@/hooks/useRatio'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, toBigNumber } from '@/utils'

type LockedDetailsProps = {
  userLock: UserLock
}

const LockedDetails: React.FC<LockedDetailsProps> = ({ userLock }) => {
  const { t } = useTranslation()

  const { amount } = useLockModalState()

  const { modalStatus } = useModalStatusState()

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
    <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InfoColumn
            title={t('modals.unlock.withdraw.withdraw-metric-1')}
            toolTipInfo={t('modals.unlock.withdraw.withdraw-metric-1-tooltip')}
            showDivider
            metric={
              <>
                <Box pt='6px' pl={2} width='max-content' textAlign='right'>
                  <TokenAmount
                    amount={
                      isValidAmount
                        ? formatAmount(ksuRemaining || '0')
                        : formatAmount(userLock.lockedAmount || '0')
                    }
                    symbol='KSU'
                  />
                  <Typography variant='caption' component='span'>
                    {percentage} %
                  </Typography>
                </Box>
              </>
            }
          />
        </Grid>
        <Grid item xs={6}>
          <InfoColumn
            title={t('modals.unlock.withdraw.withdraw-metric-2')}
            toolTipInfo={t('modals.unlock.withdraw.withdraw-metric-2-tooltip')}
            showDivider
            metric={
              <>
                <Box pt='6px' pl={2} width='max-content' textAlign='right'>
                  <TokenAmount
                    amount={
                      isValidAmount
                        ? formatAmount(rKsuRemaining || '0')
                        : formatAmount(userLock.rKSUAmount || '0')
                    }
                    symbol='rKSU'
                  />
                  <Typography variant='caption' component='span'>
                    {percentage} %
                  </Typography>
                </Box>
              </>
            }
          />
        </Grid>
      </Grid>
    </ColoredBox>
  )
}

export default LockedDetails
