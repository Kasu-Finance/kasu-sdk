'use client'

import { useEffect } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserNfts from '@/hooks/portfolio/useUserNfts'

import { ModalsKeys } from '@/context/modal/modal.types'

const NftTracker = () => {
  const { userNfts } = useUserNfts()

  const { openModal } = useModalState()

  useEffect(() => {
    const nftDetectedShownPreviously =
      localStorage.getItem('NFT_DETECTED') === 'true'

    if (!nftDetectedShownPreviously && userNfts) {
      localStorage.setItem('NFT_DETECTED', 'true')

      openModal({ name: ModalsKeys.NFT_DETECTED })
    }
  }, [userNfts, openModal])

  return null
}

export default NftTracker
