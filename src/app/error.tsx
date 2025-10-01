'use client' // Error boundaries must be Client Components

import { Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { useEffect } from 'react'

import Cat from '@/images/cat.png'

export default function Error({
  error,
  // reset,
}: {
  error: Error & { digest?: string }
  // reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Stack mt={20} alignItems='center'>
      <Image src={Cat} alt='Cat' style={{ width: 548, height: 'auto' }} />
      <Typography variant='h3' color='gray.extraDark'>
        Something went wrong! Please try again.
      </Typography>
    </Stack>
  )
}
