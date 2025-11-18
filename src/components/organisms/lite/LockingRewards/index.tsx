import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import LockingRewardsTableBody from '@/components/organisms/lite/LockingRewards/LockingRewardsTableBody'
import LockingRewardsTableHeader from '@/components/organisms/lite/LockingRewards/LockingRewardsTableHeader'

const LockingRewards = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={3}>
      <Typography variant='h3' color='gold.dark'>
        {t('portfolio.rewards.subheader-1.title')}
      </Typography>
      <LiteModeTable
        tableHeader={<LockingRewardsTableHeader />}
        tableBody={<LockingRewardsTableBody />}
      />
    </Stack>
  )
}

export default LockingRewards
