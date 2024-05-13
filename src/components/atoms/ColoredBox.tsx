import { Box, styled } from '@mui/material'

const ColoredBox = styled(Box)((props) => ({
  display: props.display ? undefined : 'block',
  background: 'rgba(211, 179, 139, 0.12)',
  borderRadius: props.theme.spacing(1),
  padding: props.theme.spacing(0.5, 0),
}))

export default ColoredBox
