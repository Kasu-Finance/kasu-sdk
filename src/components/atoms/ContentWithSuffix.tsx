import { Theme } from '@emotion/react'
import { SxProps, Typography, TypographyProps } from '@mui/material'

interface ContentWithSuffixProps {
  content: string | number
  suffix?: string
  sx?: SxProps<Theme>
}

const ContentWithSuffix: React.FC<ContentWithSuffixProps & TypographyProps> = ({
  content = '',
  suffix = '',
  sx,
  ...typographyProps
}) => {
  return (
    <Typography variant='h6' {...typographyProps} sx={{ pl: 2, ...sx }}>
      {content}{' '}
      {suffix && (
        <Typography variant='body1' component='span'>
          {suffix}
        </Typography>
      )}
    </Typography>
  )
}

export default ContentWithSuffix
