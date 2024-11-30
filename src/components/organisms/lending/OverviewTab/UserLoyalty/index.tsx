import { Box, Grid2, Typography } from '@mui/material'
import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import Image from 'next/image'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import WaveBox from '@/components/atoms/WaveBox'
import BonusAndRewards from '@/components/organisms/lending/OverviewTab/UserLoyalty/BonusAndRewards'
import LoyaltyProgressOverview from '@/components/organisms/lending/OverviewTab/UserLoyalty/LoyaltyProgressOverview'
import UserLoyaltyActions from '@/components/organisms/lending/OverviewTab/UserLoyalty/UserLoyaltyActions'
import UserLoyaltyLevel from '@/components/organisms/lending/OverviewTab/UserLoyalty/UserLoyaltyLevel'

import CrownedCat from '@/images/crowned-cat.png'

import { PoolOverviewWithDelegate } from '@/types/page'

type UserLoyaltyProps = {
  pools: PoolOverviewWithDelegate[]
  poolId: string
  currentEpoch: string
  lockPeriods: LockPeriod[]
}

const UserLoyalty: React.FC<UserLoyaltyProps> = async ({
  pools,
  poolId,
  currentEpoch,
  lockPeriods,
}) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('lending.poolOverview.lockingStatus.title')} />
      <WaveBox borderRadius={2}>
        <Box px={2} py={3}>
          <Typography variant='h4'>
            {t('lending.poolOverview.lockingStatus.subtitle')}
          </Typography>
        </Box>
        <CustomInnerCardContent sx={{ py: 3, px: 0 }}>
          <Grid2 container spacing={4} mb={7} px={2} alignItems='end'>
            {/* <Grid2 flex={1} alignSelf='start'>
              <CurrentLoyaltyDescription />
            </Grid2> */}
            <Grid2 px={1}>
              <Image src={CrownedCat} alt='Crowned Cat' />
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
      </WaveBox>
    </CustomCard>
  )
}

export default UserLoyalty
