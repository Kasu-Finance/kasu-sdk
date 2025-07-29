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

import useLiteModeState from '@/hooks/context/useLiteModeState'

import { customTypography } from '@/themes/typography'

const ModeToggleButton = () => {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const { isLiteMode, toggleLiteMode } = useLiteModeState()

  const [text, setText] = useState<'Lite' | 'PRO'>(isLiteMode ? 'Lite' : 'PRO')

  const ref = useRef<HTMLDivElement>(null)

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || open || isMounted) return

    setText((prev) => (prev === 'Lite' ? 'PRO' : 'Lite'))

    setIsMounted(true)

    const button = e.currentTarget.getBoundingClientRect()

    ref.current.style.setProperty('left', `${button.left + button.width / 2}px`)
    ref.current.style.setProperty('top', `${button.top}px`)
    ref.current.style.setProperty('position', 'fixed')

    setTimeout(() => {
      setOpen(true)
    }, 50)

    setTimeout(() => {
      toggleLiteMode()
    }, 600)

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
        color='primary'
        sx={{
          width: 160,
          textTransform: 'unset',
          ...customTypography.baseSm,
          ...(!isLiteMode && {
            color: 'gold.dark',
            bgcolor: 'gray.extraLight',
          }),
        }}
        onClick={toggle}
      >
        Switch to Kasu {isLiteMode ? 'PRO' : 'Lite'}
      </Button>
      <Portal>
        <Box
          ref={ref}
          className={open ? 'expanded' : ''}
          position='relative'
          zIndex={99999999999}
          bgcolor={isLiteMode ? 'gray.extraDark' : 'gray.extraLight'}
          display='flex'
          alignItems='center'
          justifyContent='center'
          sx={{
            width: '0vw',
            height: '0vh',
            borderRadius: '120px',
            opacity: 0,
            left: open ? `0 !important` : undefined,
            top: open ? `0 !important` : undefined,
            transition: `width 0.3s ease-in, 
                         left 0.3s ease-in, 
                         top 0.3s ease-in, 
                         height 0.3s ease-in, 
                         background-color 0s linear 0.5s, 
                         opacity 0.1s linear 1s, 
                         border-radius 0.5s ease-out`,
            '&.expanded': {
              width: '100vw',
              height: '100vh',
              borderRadius: 0,
              opacity: 100,
              backgroundColor: isLiteMode
                ? 'gray.extraDark'
                : 'gray.extraLight',
              transition: `width 0.4s ease-in, 
                           left 0.4s ease-in, 
                           top 0.4s ease-in, 
                           height 0.4s ease-in, 
                           background-color 0.3s linear 0.5s, 
                           opacity 0.1s linear, 
                           border-radius 0.5s ease-in`,
            },
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
                className={open ? 'expanded' : ''}
                color={isLiteMode ? 'gold.dark' : 'gray.extraDark'}
                sx={{
                  transition: 'color 0.3s ease 0.5s',
                  '&.expanded': {
                    color: isLiteMode ? 'gold.dark' : 'gray.extraDark',
                  },
                }}
              >
                Entering Kasu {text}
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
