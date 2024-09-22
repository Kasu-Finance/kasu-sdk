import { Stack, StackProps, Typography } from '@mui/material'
import Image from 'next/image'

import Cat from '@/images/cat.png'

type EmptyDataPlaceholderProps = StackProps & {
  text?: string
}

const EmptyDataPlaceholder: React.FC<EmptyDataPlaceholderProps> = ({
  text,
  ...rest
}) => {
  return (
    <Stack alignItems='center' {...rest}>
      <Image src={Cat} alt='Cat' />
      <Typography variant='h4'>{text ?? 'No data...'}</Typography>
    </Stack>
  )
}

export default EmptyDataPlaceholder
