import { Box, Grid, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { UserLock } from 'kasu-sdk/src/types'

import useLockModalState from '@/hooks/context/useLockModalState'
import useRatio from '@/hooks/useRatio'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, toBigNumber } from '@/utils'

type LockedDetailsProps = {
  userLock: UserLock
}

const LockedDetails: React.FC<LockedDetailsProps> = ({ userLock }) => {
  const { lockState, amount } = useLockModalState()

  const ratio = useRatio(amount, userLock.lockedAmount)

  const isValidAmount = toBigNumber(amount).lte(
    toBigNumber(userLock.lockedAmount)
  )

  const percentage = isValidAmount
    ? formatAmount(formatEther(ratio.mul(100)), {
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
    <ColoredBox sx={{ bgcolor: lockState.bgColor, mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InfoColumn
            title='KSU Remaining'
            toolTipInfo='info'
            showDivider
            metric={
              <>
                <Box pt='6px' pl={2} width='max-content' textAlign='right'>
                  <Box>
                    <TokenAmount
                      amount={
                        isValidAmount ? ksuRemaining : userLock.lockedAmount
                      }
                      symbol='KSU'
                    />
                  </Box>
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
            title='rKSU Remaining'
            toolTipInfo='info'
            showDivider
            metric={
              <>
                <Box pt='6px' pl={2} width='max-content' textAlign='right'>
                  <Box>
                    <TokenAmount
                      amount={
                        isValidAmount ? rKsuRemaining : userLock.rKSUAmount
                      }
                      symbol='rKSU'
                    />
                  </Box>
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
