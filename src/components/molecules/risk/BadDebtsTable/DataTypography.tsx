import { Typography, TypographyProps } from '@mui/material'

import ToolTip from '@/components/atoms/ToolTip'

interface DataTypographyProps extends TypographyProps {
  data: number | string | null
  suffix?: string
  toolTip?: string
}

const DataTypography: React.FC<DataTypographyProps> = ({
  data,
  suffix,
  toolTip,
  ...typographyProps
}) => {
  const isValidData = data !== null && data !== undefined && data !== ''
  const content = isValidData ? data : 'N/A'
  const color = isValidData ? 'inherit' : 'grey.400'

  return (
    <Typography {...typographyProps} color={color}>
      {content}
      {suffix && isValidData && (
        <Typography variant='caption' component='span'>
          {suffix}
        </Typography>
      )}
      {toolTip && (
        <ToolTip
          iconSx={{
            position: 'relative',
            top: '4px',
          }}
          title={toolTip}
        />
      )}
    </Typography>
  )
}

export default DataTypography
