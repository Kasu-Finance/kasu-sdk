'use client'

import {
  Box,
  Button,
  LinearProgress,
  Portal,
  Stack,
  Typography,
} from '@mui/material'
import { MouseEvent, useRef, useState } from 'react'

import { customTypography } from '@/themes/typography'

const ModeToggleButton = () => {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || open || isMounted) return

    setIsMounted(true)

    const button = e.currentTarget.getBoundingClientRect()

    ref.current.style.setProperty('left', `${button.left + button.width / 2}px`)
    ref.current.style.setProperty('top', `${button.top}px`)
    ref.current.style.setProperty('position', 'fixed')

    setTimeout(() => {
      setOpen(true)
    }, 50)

    setTimeout(() => {
      setOpen(false)
    }, 2300)

    setTimeout(() => {
      setIsMounted(false)
    }, 2800)
  }

  return (
    <Box
      sx={{
        mr: 1.25,
      }}
    >
      <Button
        variant='contained'
        sx={{
          width: 160,
          textTransform: 'unset',
          color: 'gold.dark',
          bgcolor: 'gray.extraLight',
          ...customTypography.baseSm,
        }}
        onClick={toggle}
      >
        Switch to Kasu Lite
      </Button>
      <Portal>
        <Box
          ref={ref}
          position='relative'
          zIndex={99999999999}
          bgcolor={open ? 'gray.extraDark' : 'gray.extraLight'}
          width={open ? '100vw' : '0vw'}
          height={open ? '100vh' : '0vh'}
          display='flex'
          alignItems='center'
          justifyContent='center'
          sx={{
            borderRadius: open ? '0' : '120px',
            pointerEvents: 'none',
            opacity: open ? 100 : 0,
            left: open ? `0 !important` : undefined,
            top: open ? `0 !important` : undefined,
            transition: `width 0.5s ease-in, 
                         left 0.5s ease-in, 
                         top 0.5s ease-in, 
                         height 0.5s ease-in, 
                         ${
                           open
                             ? `background-color 0.3s linear 1s, 
                            opacity 0.1s linear, 
                            border-radius 0.5s ease-in`
                             : `background-color 0s linear 0.5s, 
                            opacity 0.1s linear 1s, 
                            border-radius 0.5s ease-out`
                         }`,
          }}
        >
          {isMounted && (
            <Stack
              spacing={2}
              visibility={open ? 'visible' : 'hidden'}
              sx={{
                opacity: open ? 1 : 0,
                transition: 'opacity 0.3s ease 0.5s',
              }}
            >
              <Typography
                variant='h2'
                color={open ? 'gold.dark' : undefined}
                sx={{
                  transition: 'color 0.3s ease 1s',
                }}
              >
                Entering Kasu Lite
              </Typography>
              <LinearProgress />
            </Stack>
          )}
        </Box>
      </Portal>
    </Box>
  )
}

export default ModeToggleButton
