import { Box, BoxProps, Typography, TypographyProps } from '@mui/material'
import React from 'react'

import getTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import Card from '@/components/molecules/CountdownCard/Card'
import CountdownSeparator from '@/components/molecules/CountdownCard/CountdownSeparator'

type CountdownCardProps = BoxProps & {
  time: EpochTimeStamp
  format?: `${string}:${string}:${string}`
  label?: [string, string, string]
  cardProps?: BoxProps
  labelProps?: TypographyProps
  separatorProps?: BoxProps
}

const CountdownCard: React.FC<CountdownCardProps> = ({
  format,
  time,
  label,
  cardProps,
  labelProps,
  separatorProps,
  ...rest
}) => {
  const { t } = getTranslation()

  return (
    <Box
      display='grid'
      gridTemplateColumns='repeat(auto-fit, minmax(0, max-content))'
      alignItems='end'
      gap={1}
      justifyContent='center'
      {...rest}
    >
      <Countdown
        endTime={time}
        format={format}
        render={(countdown) => {
          const [first, second, third] = countdown.split(':')

          return (
            <>
              <Box display='flex' gap={0.5} position='relative'>
                <Card value={first[0]} {...cardProps} />
                <Card value={first[1]} {...cardProps} />
                <Typography
                  variant='baseXs'
                  position='absolute'
                  sx={{ transform: 'translateX(-50%)' }}
                  left='50%'
                  bottom='-20px'
                  {...labelProps}
                >
                  {label?.[0] ?? t('time.days')}
                </Typography>
              </Box>
              <CountdownSeparator {...separatorProps} />
              <Box display='flex' gap={0.5} position='relative'>
                <Card value={second[0]} {...cardProps} />
                <Card value={second[1]} {...cardProps} />
                <Typography
                  variant='baseXs'
                  position='absolute'
                  sx={{ transform: 'translateX(-50%)' }}
                  left='50%'
                  bottom='-20px'
                  {...labelProps}
                >
                  {label?.[1] ?? t('time.hours')}
                </Typography>
              </Box>
              <CountdownSeparator {...separatorProps} />
              <Box display='flex' gap={0.5} position='relative'>
                <Card value={third[0]} {...cardProps} />
                <Card value={third[1]} {...cardProps} />
                <Typography
                  variant='baseXs'
                  position='absolute'
                  sx={{ transform: 'translateX(-50%)' }}
                  left='50%'
                  bottom='-20px'
                  {...labelProps}
                >
                  {label?.[2] ?? t('time.minutes')}
                </Typography>
              </Box>
            </>
          )
        }}
      />
    </Box>
  )
}

export default CountdownCard
