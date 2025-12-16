import ReplayIcon from '@mui/icons-material/Replay'
import { Box, Grid2, IconButton, Stack, Typography } from '@mui/material'
import { useRef } from 'react'

import useVideoControls from '@/hooks/useVideoControls'

import DottedDivider from '@/components/atoms/DottedDivider'
import ControlBar from '@/components/organisms/lite/LiteHome/KasuIntroVideo/ControlBar'

import { PlayIcon } from '@/assets/icons'

const KasuIntroVideo = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    controls,
    handleBlur,
    handleFocus,
    handlePause,
    handlePlay,
    handleSeek,
    handleMouseMove,
    handleVolumeChange,
    togglePlay,
    toggleFullscreen,
    toggleMute,
  } = useVideoControls(videoRef, videoContainerRef)

  return (
    <Stack spacing={{ xs: 4, md: 8 }} my={{ xs: 4, md: 8 }}>
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
        display='flex'
        justifyContent='center'
        onClick={togglePlay}
        onMouseMove={handleMouseMove}
        sx={{
          width: '100%',
          height: { xs: 'auto', md: 671 },
          aspectRatio: { xs: '16 / 9', md: 'unset' },
        }}
      >
        {(controls.currentTime === 0 ||
          controls.currentTime === controls.duration) && (
          <Box
            position='absolute'
            top={0}
            left={0}
            width='100%'
            height='100%'
            zIndex={2}
          >
            <IconButton
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onClick={handlePlay}
              color='primary'
            >
              {controls.currentTime === 0 ? <PlayIcon /> : <ReplayIcon />}
            </IconButton>
          </Box>
        )}
        {(controls.visible ||
          (videoRef.current?.paused && controls.currentTime !== 0)) && (
          <Box
            position='absolute'
            top={0}
            left={0}
            width='100%'
            height='100%'
            zIndex={1}
            sx={{
              background:
                'linear-gradient(to bottom,hsla(0, 0%, 0%, 0) 0%,hsla(0, 0%, 0%, 0.013) 8.1%,hsla(0, 0%, 0%, 0.049) 15.5%,hsla(0, 0%, 0%, 0.104) 22.5%,hsla(0, 0%, 0%, 0.175) 29%,hsla(0, 0%, 0%, 0.259) 35.3%,hsla(0, 0%, 0%, 0.352) 41.2%,hsla(0, 0%, 0%, 0.37) 47.1%,hsla(0, 0%, 0%, 0.39) 52.9%,hsla(0, 0%, 0%, 0.40) 58.8%,hsla(0, 0%, 0%, 0.45) 64.7%,hsla(0, 0%, 0%, 0.52) 71%,hsla(0, 0%, 0%, 0.58) 77.5%,hsla(0, 0%, 0%, 0.64) 84.5%,hsla(0, 0%, 0%, 0.7) 91.9%, hsla(0, 0%, 0%, 0.8) 100%) repeat-x bottom left',
              backgroundSize: 'auto 110px',
            }}
          >
            <ControlBar
              controls={controls}
              handlePause={handlePause}
              handlePlay={handlePlay}
              handleSeek={handleSeek}
              toggleMute={toggleMute}
              handleVolumeChange={handleVolumeChange}
              toggleFullscreen={toggleFullscreen}
            />
          </Box>
        )}
        <Box
          component='video'
          width={controls.fullscreen ? 'auto' : '100%'}
          height={controls.fullscreen ? '100%' : '100%'}
          ref={videoRef}
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
