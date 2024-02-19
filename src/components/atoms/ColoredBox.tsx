import { Box, styled } from '@mui/material'

const ColoredBox = styled(Box)((props) => ({
  display: props.display ? undefined : 'block',
  background: 'rgba(25, 118, 210, 0.04)',
  borderRadius: props.theme.spacing(1),
  padding: props.theme.spacing(0.5, 0),
}))

export default ColoredBox
