'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { isAddress } from 'viem'

import useModalState from '@/hooks/context/useModalState'

import { ModalsKeys } from '@/context/modal/modal.types'

const ReferralDetector = () => {
  const searchParams = useSearchParams()

  const referralCode = searchParams.get('referralCode')

  const { openModal } = useModalState()

  useEffect(() => {
    if (referralCode && isAddress(referralCode)) {
      openModal({ name: ModalsKeys.REFERRAL_DETECTED, referralCode })
    }
  }, [referralCode, openModal])

  return null
}

export default ReferralDetector
