import { Typography } from '@mui/material'

interface ContentWithSuffixProps {
  content: string | number
  suffix?: string
}

const ContentWithSuffix: React.FC<ContentWithSuffixProps> = ({
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
