import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { Box, IconButton, Slider, Stack, Typography } from '@mui/material'
import { MouseEvent } from 'react'

import { VideoControls } from '@/hooks/useVideoControls'

import { TimeConversions } from '@/utils'

type ControlBarProps = {
  controls: VideoControls
  handlePlay: (e: MouseEvent<HTMLButtonElement>) => void
  handlePause: (e: MouseEvent<HTMLButtonElement>) => void
  handleSeek: (event: Event, value: number | number[]) => void
  toggleMute: (e: MouseEvent<HTMLButtonElement>) => void
  handleVolumeChange: (e: Event, value: number | number[]) => void
  toggleFullscreen: (e: MouseEvent<HTMLButtonElement>) => void
}

const ControlBar: React.FC<ControlBarProps> = ({
  controls,
  handleSeek,
  handlePause,
  handlePlay,
  toggleMute,
  handleVolumeChange,
  toggleFullscreen,
}) => {
  const getTimeFormat = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / TimeConversions.SECONDS_PER_HOUR)
    const minutes = Math.floor(
      (totalSeconds % TimeConversions.SECONDS_PER_HOUR) /
        TimeConversions.SECONDS_PER_MINUTE
    )
    const seconds = totalSeconds % TimeConversions.SECONDS_PER_MINUTE

    const formattedHours = String(hours).padStart(2, '0')
    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')

    const defaultFormat = `${formattedMinutes}:${formattedSeconds}`

    if (hours <= 0) {
      return defaultFormat
    }

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
  }

  return (
    <Stack
      position='absolute'
      bottom={0}
      my={1}
      width='100%'
      onClick={(e) => e.stopPropagation()}
    >
      <Box px={2}>
        <Slider
          aria-label='Time'
          color='primary'
          value={controls.currentTime}
          min={0}
          max={controls.duration}
          step={1}
          onChange={handleSeek}
          sx={{
            py: 0,
            '.MuiSlider-thumb': {
              '&:hover': {
                boxShadow: '0px 0px 0px 8px rgba(196, 153, 108, 0.16)',
              },
              '&.Mui-active': {
                boxShadow: '0px 0px 0px 8px rgba(196, 153, 108, 0.16)',
              },

              '&::after': {
                width: 32,
                height: 32,
              },
            },
          }}
          slotProps={{
            thumb: {
              style: {
                width: 12,
                height: 12,
              },
            },
            track: {
              style: {
                height: 3,
              },
            },
          }}
        />
      </Box>
      <Box
        width='100%'
        height={42}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        px={2}
      >
        <Box display='flex' alignItems='center' gap={1}>
          <IconButton
            onClick={controls.play ? handlePause : handlePlay}
            color='primary'
          >
            {controls.play ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Box
            display='flex'
            alignItems='center'
            overflow='hidden'
            sx={{
              '&:hover, &:focus-within': {
                '& > .MuiBox-root': {
                  width: 86,
                },
              },
            }}
          >
            <IconButton color='primary' onClick={toggleMute}>
              {controls.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Box
              width={{ xs: 86, md: 0 }}
              display='flex'
              alignItems='center'
              overflow='hidden'
              sx={{
                transition: 'width 0.2s ease-in',
              }}
            >
              <Box px={2} width='100%' display='flex' alignItems='center'>
                <Slider
                  aria-label='Volume'
                  color='primary'
                  value={controls.muted ? 0 : controls.volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.01}
                  sx={{
                    '.MuiSlider-thumb': {
                      '&:hover': {
                        boxShadow: '0px 0px 0px 8px rgba(196, 153, 108, 0.16)',
                      },
                      '&.Mui-active': {
                        boxShadow: '0px 0px 0px 8px rgba(196, 153, 108, 0.16)',
                      },

                      '&::after': {
                        width: 32,
                        height: 32,
                      },
                    },
                  }}
                  slotProps={{
                    thumb: {
                      style: {
                        width: 12,
                        height: 12,
                      },
                    },
                    track: {
                      style: {
                        height: 3,
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Typography variant='baseMd' color='gold.dark'>
            {getTimeFormat(Math.floor(controls.currentTime))} /{' '}
            {getTimeFormat(Math.floor(controls.duration))}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={toggleFullscreen} color='primary'>
            {controls.fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      </Box>
    </Stack>
  )
}

export default ControlBar
