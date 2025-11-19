import { Box, BoxProps } from '@mui/material'

const CountdownSeparator: React.FC<BoxProps> = (props) => (
  <Box display='flex' flexDirection='column' gap={1} mb={2} {...props}>
    <Box bgcolor='gray.extraDark' width={8} height={8} borderRadius='50%' />
    <Box bgcolor='gray.extraDark' width={8} height={8} borderRadius='50%' />
  </Box>
)

export default CountdownSeparator
