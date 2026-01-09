'use client'

import { Box, Icon, Stack, Typography } from '@mui/material'

import useReadOnlySdk from '@/hooks/context/useReadOnlySdk'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import { CrossIcon, PartialVerifiedIcon, VerifiedIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'

const benefits = {
  '-1': {
    protocolFeeSharing: false,
    apyBonus: false,
    priorityAccess: false,
    priortiyWithdrawal: false,
  },
  '0': {
    protocolFeeSharing: true,
    apyBonus: false,
    priorityAccess: false,
    priortiyWithdrawal: false,
  },
  '1': {
    protocolFeeSharing: true,
    apyBonus: true,
    priorityAccess: true,
    priortiyWithdrawal: true,
  },
  '2': {
    protocolFeeSharing: true,
    apyBonus: true,
    priorityAccess: true,
    priortiyWithdrawal: true,
  },
} as const

const CurrentLoyaltyBenefits = () => {
  const readOnlySdk = useReadOnlySdk()
  const { stakedPercentage } = useLockingPercentage({ sdk: readOnlySdk })

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const hasProtocolFeeSharing = Boolean(
    benefits[currentLevel]?.protocolFeeSharing
  )
  const hasApyBonus = Boolean(benefits[currentLevel]?.apyBonus)
  const hasPriorityAccess = Boolean(benefits[currentLevel]?.priorityAccess)
  const hasPriorityWithdrawal = Boolean(
    benefits[currentLevel]?.priortiyWithdrawal
  )

  return (
    <Stack spacing={2} width='100%' color='white'>
      <Box display='flex' gap={1} alignItems='center'>
        {hasProtocolFeeSharing ? (
          <Icon
            sx={{
              p: 0,
              m: 0,
              width: 24,
              height: 24,
              fontSize: 'unset',
              path: {
                fill: customPalette.gold.dark,
              },
            }}
          >
            <VerifiedIcon />
          </Icon>
        ) : (
          <CrossIcon />
        )}
        <Typography
          variant='baseMdBold'
          color={hasProtocolFeeSharing ? 'gold.dark' : undefined}
        >
          {!hasProtocolFeeSharing && 'No'} Protocol Fee Sharing
        </Typography>
      </Box>
      <Box display='flex' gap={1}>
        {hasApyBonus ? (
          <Icon
            sx={{
              p: 0,
              m: 0,
              width: 24,
              height: 24,
              fontSize: 'unset',
              path: {
                fill: customPalette.gold.dark,
              },
            }}
          >
            {currentLevel === 1 ? <PartialVerifiedIcon /> : <VerifiedIcon />}
          </Icon>
        ) : (
          <CrossIcon />
        )}
        <Typography
          variant='baseMdBold'
          color={hasApyBonus ? 'gold.dark' : undefined}
        >
          {!hasApyBonus && 'No'} APY Bonus
        </Typography>
      </Box>
      <Box display='flex' gap={1}>
        {hasPriorityAccess ? (
          <Icon
            sx={{
              p: 0,
              m: 0,
              width: 24,
              height: 24,
              fontSize: 'unset',
              path: {
                fill: customPalette.gold.dark,
              },
            }}
          >
            {currentLevel === 1 ? <PartialVerifiedIcon /> : <VerifiedIcon />}
          </Icon>
        ) : (
          <CrossIcon />
        )}
        <Typography
          variant='baseMdBold'
          color={hasPriorityAccess ? 'gold.dark' : undefined}
        >
          {!hasPriorityAccess && 'No'} Priority Access to Lending Strategies
        </Typography>
      </Box>
      <Box display='flex' gap={1}>
        {hasPriorityWithdrawal ? (
          <Icon
            sx={{
              p: 0,
              m: 0,
              width: 24,
              height: 24,
              fontSize: 'unset',
              path: {
                fill: customPalette.gold.dark,
              },
            }}
          >
            {currentLevel === 1 ? <PartialVerifiedIcon /> : <VerifiedIcon />}
          </Icon>
        ) : (
          <CrossIcon />
        )}
        <Typography
          variant='baseMdBold'
          color={hasPriorityWithdrawal ? 'gold.dark' : undefined}
        >
          {!hasPriorityWithdrawal && 'No'} Priority Withdrawal
        </Typography>
      </Box>
    </Stack>
  )
}

export default CurrentLoyaltyBenefits
