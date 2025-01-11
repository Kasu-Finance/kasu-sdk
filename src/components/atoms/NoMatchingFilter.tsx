import { Stack, Typography, TypographyProps } from '@mui/material'
import Image from 'next/image'

import CatWithFunnel from '@/images/cat-with-funnel.png'

type NoMatchingFilterProps = {
  text?: string
  typographyProps?: TypographyProps
}

const NoMatchingFilter: React.FC<NoMatchingFilterProps> = ({
  typographyProps,
  text,
}) => (
  <Stack alignItems='center'>
    <Image
      width={342}
      height={277}
      src={CatWithFunnel}
      alt='Cat holding a golden funnel'
    />
    <Typography variant='h4' component='p' {...typographyProps}>
      {text ?? 'No data matching the filters'}
    </Typography>
  </Stack>
)

export default NoMatchingFilter
