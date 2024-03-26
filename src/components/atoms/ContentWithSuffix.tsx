import { Typography, TypographyProps } from '@mui/material'

interface ContentWithSuffixProps {
  content: string | number
  suffix?: string
}

const ContentWithSuffix: React.FC<ContentWithSuffixProps & TypographyProps> = ({
  content = '',
  suffix = '',
  ...typographyProps
}) => {
  return (
    <Typography variant='h6' {...typographyProps} sx={{ pl: 2 }}>
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
