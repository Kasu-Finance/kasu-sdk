import { Box, styled } from '@mui/material'

const ModalBody = styled(Box)((props) => ({
  padding: props.theme.spacing(0, 3),
  boxShadow: props.theme.shadows[24],
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  background: '#ffffff',
}))

export default ModalBody
