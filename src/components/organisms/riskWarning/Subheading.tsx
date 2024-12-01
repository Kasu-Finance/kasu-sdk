import { Box, Typography } from '@mui/material'

import { BadgeIcon } from '@/assets/icons'

type SubheadingProps = {
  title: string
}

const Subheading: React.FC<SubheadingProps> = ({ title }) => {
  return (
    <Box display='flex' alignItems='center' gap={1.5}>
      <BadgeIcon />
      <Typography variant='h4'>{title}</Typography>
    </Box>
  )
}

export default Subheading
