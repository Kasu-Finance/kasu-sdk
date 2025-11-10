'use client' // Error boundaries must be Client Components

import { Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'

import Cat from '@/images/cat.png'

export default function Error({
  error,
  // reset,
}: {
  error: Error & { digest?: string }
  // reset: () => void
}) {
  const chainId = useChainId()
  const { address } = useAccount()

  useEffect(() => {
    fetch('/api/logging', {
      body: JSON.stringify({
        error: {
          message: error.message,
          cause: error.cause,
          name: error.name,
          stack: error.stack,
        },
        chainId,
        address,
        isBoundaryError: true,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
    })
  }, [error, address, chainId])

  return (
    <Stack mt={20} alignItems='center'>
      <Image src={Cat} alt='Cat' style={{ width: 548, height: 'auto' }} />
      <Typography variant='h3' color='gray.extraDark'>
        Currently under maintenance, please try again later.
      </Typography>
    </Stack>
  )
}
