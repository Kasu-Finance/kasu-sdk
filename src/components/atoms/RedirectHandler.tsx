'use client'

import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'

import useDelayedExecution from '@/hooks/useDelayedExecution'

const RedirectHandler: React.FC<{ delay: number; url: string }> = ({
  delay,
  url,
}) => {
  const account = useAccount()
  const delayed = useDelayedExecution(delay)

  useEffect(() => {
    if (!account.address && delayed) {
      redirect(url)
    }
  }, [account, delayed, url])

  return null
}

export default RedirectHandler
