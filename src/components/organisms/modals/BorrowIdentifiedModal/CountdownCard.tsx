import { Box, Typography } from '@mui/material'

type CountdownCardProps = {
  value: string
}

const CountdownCard: React.FC<CountdownCardProps> = ({ value }) => (
  <Box
    bgcolor='gray.extraDark'
    height={96}
    width={50}
    display='flex'
    alignItems='center'
    justifyContent='center'
    borderRadius={2}
  >
    <Typography variant='h3' color='gold.middle'>
      {value}
    </Typography>
  </Box>
)

export default CountdownCard
