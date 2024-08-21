import { Box, BoxProps, Divider, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

type RepaymentSectionProps = BoxProps & {
  data: {
    label: string
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
  const { t } = useTranslation()

  return (
    <Box {...rest}>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography variant='h5'>{title}</Typography>
        <Typography variant='baseMd' color='gray.middle'>
          {subtitle}
        </Typography>
      </Box>
      <Divider sx={{ mt: 1.5 }} />
      {data.map(({ label, value }) => (
        <InfoRow
          key={label}
          title={t(`repayments.sections.map.${label}.label`)}
          toolTipInfo={t(`repayments.sections.map.${label}.tooltip`)}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {value} {unit}
            </Typography>
          }
        />
      ))}
    </Box>
  )
}
export default RepaymentSection
