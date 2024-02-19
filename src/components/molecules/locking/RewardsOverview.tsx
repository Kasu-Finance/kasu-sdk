'use client'

import { Box, Button, Divider, Typography } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useTranslation from '@/hooks/useTranslation'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'

import { VerifiedIcon } from '@/assets/icons'

const RewardsOverview = () => {
  const { lockingRewards } = useLockingRewards()
  const { t } = useTranslation()
  const claimRewards = useClaimLockingRewards()

  return (
    <CardWidget
      title='Your Rewards • Claimable & Lifetime'
      cardAction={
        <Button
          sx={{
            width: 194,
            '& .MuiButton-startIcon > svg > path': {
              fill: 'white',
              fillOpacity: 1,
            },
          }}
          onClick={claimRewards}
          variant='contained'
          startIcon={<VerifiedIcon />}
        >
          {t('general.claim')} {t('general.rewards')}
        </Button>
      }
    >
      <Box
        p={(theme) => theme.spacing('6px', 2)}
        display='flex'
        alignItems='center'
      >
        <Typography variant='subtitle2' component='span'>
          Your Claimable Protocol Fee Rewards
        </Typography>
        <ToolTip title='The amount KSU rewards that can be claimed upon the conclusion of the current Epoch.​' />
      </Box>
      <Divider />
      <Box pt='6px' pl={2}>
        <TokenAmount
          amount={lockingRewards?.claimableRewards ?? '0'}
          symbol='USDC'
        />
      </Box>
      <ColoredBox mt={2}>
        <InfoRow
          title='Your Lifetime Protocol Fee Rewards'
          toolTipInfo='info'
          metric={
            <Box>
              <TokenAmount
                amount={lockingRewards?.lifeTimeRewards ?? '0'}
                symbol='USDC'
              />
            </Box>
          }
        />
      </ColoredBox>
    </CardWidget>
  )
}

export default RewardsOverview
