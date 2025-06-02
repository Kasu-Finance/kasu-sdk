'use client'

import { usePrivy } from '@privy-io/react-auth'
import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'

import useDelayedExecution from '@/hooks/useDelayedExecution'

const RedirectHandler: React.FC<{ delay: number; url: string }> = ({
  delay,
  url,
}) => {
  const { ready } = usePrivy()
  const account = useAccount()
  const delayed = useDelayedExecution(ready ? delay : 0)

  useEffect(() => {
    if (ready && !account.address && delayed) {
      redirect(url)
    }
  }, [account, ready, delayed, url])

  return null
}

export default RedirectHandler
