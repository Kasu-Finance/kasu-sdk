'use client'

import { useWeb3React } from '@web3-react/core'
import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'

import useDelayedExecution from '@/hooks/useDelayedExecution'

const RedirectHandler: React.FC<{ delay: number; url: string }> = ({
  delay,
  url,
}) => {
  const { account } = useWeb3React()
  const delayed = useDelayedExecution(delay)

  useEffect(() => {
    if (!account && delayed) {
      redirect(url)
    }
  }, [account, delayed, url])

  return null
}

export default RedirectHandler
