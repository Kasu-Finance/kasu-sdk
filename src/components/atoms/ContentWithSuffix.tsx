import { Theme } from '@emotion/react'
import { SxProps, Typography, TypographyProps } from '@mui/material'

interface ContentWithSuffixProps {
  content: string | number
  suffix?: string
  suffixVariant?: TypographyProps['variant']
  sx?: SxProps<Theme>
}

const ContentWithSuffix: React.FC<ContentWithSuffixProps & TypographyProps> = ({
  content = '',
  suffix = '',
  sx,
  suffixVariant = 'body1',
  ...typographyProps
}) => {
  return (
    <Typography
      variant='h6'
      {...typographyProps}
      sx={[{ pl: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {content}{' '}
      {suffix && (
        <Typography variant={suffixVariant} component='span'>
          {suffix}
        </Typography>
      )}
    </Typography>
  )
}

export default ContentWithSuffix
