import { Box, Grid2, IconButton, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'
import ControlBar from '@/components/organisms/lite/LiteHome/KasuIntroVideo/ControlBar'

import { PlayIcon } from '@/assets/icons'

const KasuIntroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [controls, setControls] = useState({
    play: false,
    fullscreen: false,
    volume: 0.5,
    time: 0,
  })

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    video.addEventListener('timeupdate', () => {
      if (!video) return

      if (video.currentTime === video.duration) {
        setControls((prev) => ({ ...prev, play: false }))
      }
    })
  }, [])

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
      <Box borderRadius={3} overflow='hidden' position='relative'>
        <Box
          position='absolute'
          top={0}
          left={0}
          width='100%'
          height='100%'
          zIndex={1}
        >
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
          <ControlBar
            controls={controls}
            handlePause={handlePause}
            handlePlay={handlePlay}
          />
        </Box>
        <Box
          component='video'
          width='100%'
          height={671}
          ref={videoRef}
          borderRadius={3}
          sx={{
            objectFit: 'cover',
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
