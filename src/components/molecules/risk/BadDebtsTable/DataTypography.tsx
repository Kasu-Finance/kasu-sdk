import { Typography, TypographyProps } from '@mui/material'

import ToolTip from '@/components/atoms/ToolTip'

import { formatAmount } from '@/utils'

interface DataTypographyProps extends TypographyProps {
  data: number | string | null
  suffix?: string
  toolTip?: string
  isLabel?: boolean
}

const DataTypography: React.FC<DataTypographyProps> = ({
  data,
  suffix,
  toolTip,
  isLabel,
  ...typographyProps
}) => {
  const isValidData = typeof data === 'number' && !isNaN(data)

  return (
    <Typography
      {...typographyProps}
      color={!isValidData && !isLabel ? 'grey.400' : 'inherit'}
    >
      {isValidData ? formatAmount(data) : isLabel ? data : 'N/A'}
      {suffix && isValidData && (
        <Typography variant='caption' component='span'>
          &nbsp;{suffix}
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
