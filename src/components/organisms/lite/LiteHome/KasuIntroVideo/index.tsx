import { Box, Grid2, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'
import ControlBar from '@/components/organisms/lite/LiteHome/KasuIntroVideo/ControlBar'

import { PlayIcon } from '@/assets/icons'

export type VideoControls = {
  play: boolean
  fullscreen: boolean
  volume: number
  time: number
  muted: boolean
  currentTime: number
  duration: number
}

const KasuIntroVideo = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [controls, setControls] = useState<VideoControls>({
    play: false,
    fullscreen: false,
    volume: 0.5,
    muted: false,
    time: 0,
    currentTime: 0,
    duration: 0,
  })

  useEffect(() => {
    const video = videoRef.current
    const videoContainer = videoContainerRef.current

    if (!video || !videoContainer) return

    videoContainer.addEventListener('fullscreenchange', () => {
      setControls((prev) => ({
        ...prev,
        fullscreen: Boolean(document.fullscreenElement),
      }))
    })

    video.addEventListener('durationchange', () => {
      setControls((prev) => ({
        ...prev,
        duration: video.duration,
      }))
    })

    video.addEventListener('timeupdate', () => {
      setControls((prev) => ({
        ...prev,
        currentTime: video.currentTime,
      }))

      if (video.currentTime === video.duration) {
        setControls((prev) => ({ ...prev, play: false }))
      }
    })
  }, [])

  const handleVolumeChange = (e: Event, value: number | number[]) => {
    if (!videoRef.current) return

    const volume = Array.isArray(value) ? value[0] : value

    videoRef.current.volume = volume

    setControls((prev) => ({
      ...prev,
      volume,
      muted: volume === 0 ? true : false,
    }))
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted

    setControls((prev) => ({ ...prev, muted: !prev.muted }))
  }

  const handlePlay = () => {
    if (!videoRef.current) return

    setControls((prev) => ({ ...prev, play: true }))

    videoRef.current.play()
  }

  const handlePause = () => {
    if (!videoRef.current) return

    setControls((prev) => ({ ...prev, play: false }))

    videoRef.current.pause()
  }

  const focusEventListener = (event: KeyboardEvent) => {
    if (!videoContainerRef.current) return

    // Note that "F" is case-sensitive (uppercase):
    if (event.key === 'F') {
      // Check if we're in fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen()
        return
      }
      // Otherwise enter fullscreen mode
      videoContainerRef.current
        .requestFullscreen({ navigationUI: 'hide' })
        .catch((err) => {
          console.error(`Error enabling fullscreen: ${err.message}`)
        })
    }

    if (event.key === 'Esc') {
      if (document.fullscreenElement) {
        document.exitFullscreen()
        return
      }
    }
  }

  const handleFocus = () => {
    document.addEventListener('keydown', focusEventListener)
  }

  const handleBlur = () => {
    document.removeEventListener('keydown', focusEventListener)
  }

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return

    if (controls.fullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    } else {
      videoContainerRef.current.requestFullscreen({ navigationUI: 'hide' })
    }
  }

  return (
    <Stack spacing={8} my={8}>
      <Grid2 container spacing={4} alignItems='center'>
        <Grid2 flex={1}>
          <DottedDivider />
        </Grid2>
        <Grid2>
          <Typography variant='h3' fontWeight={400} color='gold.dark'>
            Learn how Kasu delivers real-world yield
          </Typography>
        </Grid2>
        <Grid2 flex={1}>
          <DottedDivider />
        </Grid2>
      </Grid2>
      <Box
        borderRadius={3}
        overflow='hidden'
        position='relative'
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={videoContainerRef}
      >
        <Box
          position='absolute'
          top={0}
          left={0}
          width='100%'
          height='100%'
          zIndex={1}
        >
          {controls.currentTime === 0 && (
            <IconButton
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onClick={handlePlay}
            >
              <PlayIcon />
            </IconButton>
          )}
          <ControlBar
            controls={controls}
            handlePause={handlePause}
            handlePlay={handlePlay}
            toggleMute={toggleMute}
            handleVolumeChange={handleVolumeChange}
            toggleFullscreen={toggleFullscreen}
          />
        </Box>
        <Box
          component='video'
          width='100%'
          height={controls.fullscreen ? '100%' : 671}
          ref={videoRef}
          borderRadius={3}
          sx={{
            objectFit: 'cover',
            '&::-webkit-media-controls': {
              display: 'none !important',
            },
          }}
          controlsList='nodownload'
        >
          <source
            src='https://kasu-finance.directus.app/assets/71ae5405-737c-4060-8eb2-307b92c6fd8a.mp4'
            type='video/mp4'
          />
          Your browser does not support the video tag.
        </Box>
      </Box>
    </Stack>
  )
}

export default KasuIntroVideo
