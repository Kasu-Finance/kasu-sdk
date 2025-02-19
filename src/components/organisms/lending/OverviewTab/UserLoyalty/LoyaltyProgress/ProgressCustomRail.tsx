import { Box, Typography } from '@mui/material'
import React, { ReactNode } from 'react'

import { theme } from '@/themes/MainTheme'

type ProgressCustomRailProps = {
  variant: 'upper' | 'lower'
  progress: number
  labels: Record<number, ReactNode>
}

const GOLD = theme.palette.gold.dark
const GRAY = theme.palette.gray.middle

const ProgressCustomRail: React.FC<ProgressCustomRailProps> = ({
  variant,
  progress,
  labels,
}) => {
  const isUpperVariant = variant === 'upper'

  return (
    <Box position='relative' height={28} display='flex'>
      <Box height={18}>
        {Object.entries(labels).map(([key, value]) => {
          const labelKey = parseInt(key)

          const isFilled = progress >= labelKey

          const isMiddleLabels = labelKey !== 0 && labelKey !== 100

          return (
            <Box
              key={key}
              position='absolute'
              left={labelKey !== 100 ? `${key}%` : undefined}
              right={labelKey === 100 ? 0 : undefined}
              display='flex'
              flexDirection='column'
              bottom={isUpperVariant ? 0 : undefined}
            >
              <Typography
                variant='baseSm'
                color={isFilled ? GOLD : GRAY}
                position='absolute'
                top={isUpperVariant ? undefined : 12}
                bottom={isUpperVariant ? 12 : undefined}
                whiteSpace='nowrap'
                right={labelKey === 100 ? 0 : undefined}
                sx={
                  isUpperVariant || !isMiddleLabels
                    ? undefined
                    : { transform: 'translateX(-50%)' }
                }
              >
                {value}
              </Typography>
              <Box
                order={isUpperVariant ? undefined : -1}
                width='1px'
                height={4}
                bgcolor={GRAY}
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default ProgressCustomRail
