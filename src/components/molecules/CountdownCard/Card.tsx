import { Box, BoxProps, Typography } from '@mui/material'

type CardProps = BoxProps & {
  value: string
}

const Card: React.FC<CardProps> = ({ value, ...rest }) => (
  <Box
    bgcolor='gray.extraDark'
    height={96}
    width={50}
    display='flex'
    alignItems='center'
    justifyContent='center'
    borderRadius={2}
    {...rest}
  >
    <Typography variant='h3' color='gold.middle'>
      {value}
    </Typography>
  </Box>
)

export default Card
