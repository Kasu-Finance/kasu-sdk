import { Stack, StackProps, Typography, TypographyProps } from '@mui/material'
import Image from 'next/image'

import Cat from '@/images/cat.png'

type EmptyDataPlaceholderProps = StackProps & {
  text?: string
  textProps?: TypographyProps
}

const EmptyDataPlaceholder: React.FC<EmptyDataPlaceholderProps> = ({
  text,
  textProps,
  children,
  ...rest
}) => {
  return (
    <Stack alignItems='center' {...rest}>
      <Image
        src={Cat}
        alt='Cat'
        style={{ width: 'min(348px, 100%)', height: 'auto' }}
      />
      <Typography variant='h4' {...textProps}>
        {text ?? 'No data...'}
      </Typography>
      {children}
    </Stack>
  )
}

export default EmptyDataPlaceholder
