import { Stack, Typography } from '@mui/material'
import Image from 'next/image'

import Cat from '@/images/cat.png'

type EmptyDataPlaceholderProps = {
  text?: string
}

const EmptyDataPlaceholder: React.FC<EmptyDataPlaceholderProps> = ({
  text,
}) => {
  return (
    <Stack alignItems='center'>
      <Image src={Cat} alt='Cat' />
      <Typography variant='h4'>{text ?? 'No data...'}</Typography>
    </Stack>
  )
}

export default EmptyDataPlaceholder
