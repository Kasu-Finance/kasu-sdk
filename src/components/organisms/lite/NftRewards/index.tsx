'use client'

import { Stack, Typography } from '@mui/material'

import useUserNfts from '@/hooks/portfolio/useUserNfts'
import useUserNftYields from '@/hooks/portfolio/useUserNftYields'
import getTranslation from '@/hooks/useTranslation'

import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import NftRewardsTableBody from '@/components/organisms/lite/NftRewards/NftRewardsTableBody'
import NftRewardsTableHeader from '@/components/organisms/lite/NftRewards/NftRewardsTableHeader'

const NftRewards = () => {
  const { t } = getTranslation()

  const { userNfts } = useUserNfts()

  const { userNftYields } = useUserNftYields()

  if (!userNfts?.length) return null

  return (
    <Stack spacing={3}>
      <Typography variant='h3' color='gold.dark'>
        {t('lite.nftRewards.title')}
      </Typography>
      <LiteModeTable
        tableHeader={<NftRewardsTableHeader />}
        tableBody={
          <NftRewardsTableBody
            userNfts={userNfts}
            userNftYields={userNftYields}
          />
        }
      />
    </Stack>
  )
}

export default NftRewards
