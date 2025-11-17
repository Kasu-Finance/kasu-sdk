import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import EmptyCardState from '@/components/atoms/EmptyCardState'
import LearnButton from '@/components/organisms/lending/OverviewTab/UserLoyalty/LearnButton'

import { PoolOverviewWithDelegate } from '@/types/page'

type UserLoyaltyProps = {
  pools: PoolOverviewWithDelegate[]
  poolId: string
  currentEpoch: string
  lockPeriods: LockPeriod[]
}

const UserLoyalty: React.FC<UserLoyaltyProps> = async () => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('lending.poolOverview.lockingStatus.title')} />
      <CustomInnerCardContent sx={{ py: 6 }}>
        <Stack alignItems='center'>
          <EmptyCardState
            color='gray.extraDark'
            variant='h5'
            message='We’re working hard on the launch of the $KASU token. In the meantime, start lending so you’re the first to benefit once $KASU launches.'
          />
          <LearnButton
            sx={{
              alignSelf: 'center',
              maxWidth: 307,
              textTransform: 'capitalize',
            }}
          />
        </Stack>
      </CustomInnerCardContent>
      {/* <WaveBox borderRadius={2}>
        <CustomInnerCardContent sx={{ py: 3, px: 0 }}>
          <Grid2 container spacing={4} mb={7} px={2} alignItems='end'>
            <Grid2 px={1}>
              <CurrentLoyaltyMascot />
              <UserLoyaltyLevel />
            </Grid2>
            <Grid2 flex={1}>
              <LoyaltyProgressOverview />
            </Grid2>
          </Grid2>
          <WaveBox borderRadius={2}>
            <Box px={2} py={3}>
              <Typography variant='h4'>
                {t('lending.poolOverview.lockingStatus.subtitle-2')}
              </Typography>
            </Box>
            <CustomInnerCardContent sx={{ pb: 0 }}>
              <BonusAndRewards
                pools={pools}
                poolId={poolId}
                currentEpoch={currentEpoch}
              />
              <UserLoyaltyActions lockPeriods={lockPeriods} />
            </CustomInnerCardContent>
          </WaveBox>
        </CustomInnerCardContent>
      </WaveBox> */}
    </CustomCard>
  )
}

export default UserLoyalty
