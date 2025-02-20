'use client'

import { useEffect } from 'react'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const WipRedirect = () => {
  const { openModal } = useModalState()

  useEffect(() => {
    openModal({ name: ModalsKeys.WIP_REDIRECT })
  }, [openModal])

  return null
}

export default WipRedirect
