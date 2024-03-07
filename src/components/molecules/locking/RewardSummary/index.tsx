'use client'

import { Box, Grid, Typography } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import ClaimButton from '@/components/molecules/locking/RewardSummary/ClaimButton'

import { formatAmount } from '@/utils'

const RewardSummary = () => {
  const { lockingRewards } = useLockingRewards()
  const { t } = useTranslation()
  const claimRewards = useClaimLockingRewards()

  return (
    <CardWidget
      title='Bonus & Rewards Summary​​'
      // cardAction={
      //   <Button
      //     sx={{
      //       width: 194,
      //       '& .MuiButton-startIcon > svg > path': {
      //         fill: 'white',
      //         fillOpacity: 1,
      //       },
      //     }}
      //     onClick={claimRewards}
      //     variant='contained'
      //     startIcon={<VerifiedIcon />}
      //   >
      //     {t('general.claim')} {t('general.rewards')}
      //   </Button>
      // }
    >
      <Grid container spacing={3}>
        <Grid
          item
          xs={6}
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
        >
          <InfoColumn
            title='Protocol Fee Sharing Balance'
            toolTipInfo='The amount KSU rewards that can be claimed upon the conclusion of the current Epoch.​'
            showDivider
            metric={
              <Box py='6px' px={2}>
                <TokenAmount
                  amount={formatAmount(
                    lockingRewards?.claimableRewards ?? '0',
                    { minDecimals: 2, hideTrailingZero: false }
                  )}
                  symbol='USDC'
                />
              </Box>
            }
          />
          <ClaimButton onClick={claimRewards}>{t('general.claim')}</ClaimButton>
        </Grid>
        <Grid item xs={6}>
          <ColoredBox sx={{ p: 0 }}>
            <InfoColumn
              title='KSU Bonus/Rewards Balance​'
              toolTipInfo='info'
              showDivider
              metric={
                <Box py='6px' px={2} textAlign='right' width='max-content'>
                  <TokenAmount
                    amount={formatAmount(
                      lockingRewards?.lifeTimeRewards ?? '0.00',
                      {
                        minDecimals: 2,
                        hideTrailingZero: false,
                      }
                    )}
                    symbol='KSU'
                  />
                  <Box>
                    <Typography
                      variant='body1'
                      component='span'
                      display='inline-block'
                    >
                      0.00
                    </Typography>
                    <Typography pl={0.5} variant='caption' component='span'>
                      USDC
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </ColoredBox>
          <ClaimButton onClick={undefined} disabled>
            {t('general.claim')}
          </ClaimButton>
        </Grid>
      </Grid>
    </CardWidget>
  )
}

export default RewardSummary
