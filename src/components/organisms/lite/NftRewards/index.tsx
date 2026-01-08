'use client'

import { Stack, Typography } from '@mui/material'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'

import useUserNfts from '@/hooks/portfolio/useUserNfts'
import useUserNftYields from '@/hooks/portfolio/useUserNftYields'
import getTranslation from '@/hooks/useTranslation'

import LiteModeTable from '@/components/molecules/CustomTable/LiteModeTable'
import NftRewardsTableBody from '@/components/organisms/lite/NftRewards/NftRewardsTableBody'
import NftRewardsTableHeader from '@/components/organisms/lite/NftRewards/NftRewardsTableHeader'

type NftRewardsProps = {
  onReady?: () => void
}

const NftRewards: FC<NftRewardsProps> = ({ onReady }) => {
  const { t } = getTranslation()

  const [shouldLoadYields, setShouldLoadYields] = useState(false)
  const readyRef = useRef(false)

  const signalReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    onReady?.()
  }, [onReady])

  const { userNfts, isLoading: isUserNftsLoading } = useUserNfts()

  useEffect(() => {
    if (isUserNftsLoading) return
    if (userNfts?.length) {
      setShouldLoadYields(true)
      return
    }
    signalReady()
  }, [isUserNftsLoading, userNfts, signalReady])

  const { userNftYields, isLoading: isUserNftYieldsLoading } = useUserNftYields(
    {
      enabled: shouldLoadYields,
    }
  )

  useEffect(() => {
    if (shouldLoadYields && !isUserNftYieldsLoading) {
      signalReady()
    }
  }, [shouldLoadYields, isUserNftYieldsLoading, signalReady])

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
