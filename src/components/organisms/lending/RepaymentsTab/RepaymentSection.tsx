import { Box, BoxProps, Divider, Typography } from '@mui/material'
import React from 'react'

import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount } from '@/utils'

type RepaymentSectionProps = BoxProps & {
  data: {
    tooltip: string
    name: string
    value: number
  }[]
  title: string
  subtitle: string
  unit: 'USDC' | 'USD'
}

const RepaymentSection: React.FC<RepaymentSectionProps> = ({
  data,
  subtitle,
  title,
  unit,
  ...rest
}) => {
  return (
    <Box {...rest}>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h5'>{title}</Typography>
        <Typography variant='baseMd' color='gray.middle'>
          {subtitle}
        </Typography>
      </Box>
      <Divider sx={{ mt: 1.5 }} />
      {data.map(({ name, tooltip, value }) => (
        <InfoRow
          key={name}
          title={name}
          toolTipInfo={tooltip}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(value, { minDecimals: 2 })} {unit}
            </Typography>
          }
        />
      ))}
    </Box>
  )
}
export default RepaymentSection
