import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, IconButton } from '@mui/material'

type ControlBarProps = {
  controls: {
    play: boolean
    fullscreen: boolean
    volume: number
    time: number
  }
  handlePlay: () => void
  handlePause: () => void
}

const ControlBar: React.FC<ControlBarProps> = ({
  controls,
  handlePause,
  handlePlay,
}) => {
  return (
    <Box
      position='absolute'
      bottom={0}
      height={42}
      width='100%'
      display='flex'
      alignItems='center'
      px={2}
      my={1}
    >
      <Box>
        <IconButton
          onClick={controls.play ? handlePause : handlePlay}
          color='primary'
        >
          {controls.play ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Box>
      <Box></Box>
    </Box>
  )
}

export default ControlBar
