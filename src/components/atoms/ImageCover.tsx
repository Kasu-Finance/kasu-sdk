import { Box, styled } from '@mui/material'

const ImageCover = styled(Box)((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  height: '100px',
  overflow: 'hidden',
  background: props.theme.palette.grey[300],
  borderTopRightRadius: '4px',
  borderTopLeftRadius: '4px',
}))

export default ImageCover
