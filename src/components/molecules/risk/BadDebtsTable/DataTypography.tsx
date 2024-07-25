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
  return (
    <Typography
      {...typographyProps}
      color={data === 'N/A' ? 'grey.400' : 'inherit'}
    >
      {data}
      {suffix && (
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
