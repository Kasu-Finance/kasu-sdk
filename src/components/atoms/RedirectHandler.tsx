'use client'

import { redirect } from 'next/navigation'
import React, { useEffect } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type RedirectHandlerProps = {
  to: string
  whenNotConnected?: boolean
}

const RedirectHandler: React.FC<RedirectHandlerProps> = ({
  to,
  whenNotConnected = false,
}) => {
  const { isAuthenticated } = usePrivyAuthenticated()

  const { isLiteMode } = useLiteModeState()

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (whenNotConnected) {
      if (!isAuthenticated) {
        timer = setTimeout(() => {
          redirect(to)
        }, 2000)
      }
    } else {
      redirect(to)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [to, isLiteMode, whenNotConnected, isAuthenticated])

  return null
}

export default RedirectHandler
