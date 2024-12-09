'use client'

import {
  Box,
  Skeleton,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'

import getTranslation from '@/hooks/useTranslation'
import useNextClearingPeriod from '@/hooks/web3/useNextClearingPeriod'

import { formatTimestamp } from '@/utils'

type NextClearingPeriodInfoProps = {
  beforeText?: string
  sx?: SxProps<Theme>
  typographyProps?: TypographyProps
  timeTypographyProps?: TypographyProps
}

const NextClearingPeriodInfo: React.FC<NextClearingPeriodInfoProps> = ({
  beforeText,
  sx,
  typographyProps,
  timeTypographyProps,
}) => {
  const { t } = getTranslation()

  const { nextClearingPeriod, isLoading } = useNextClearingPeriod()

  const formattedNextClearingPeriod = formatTimestamp(nextClearingPeriod, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box
      bgcolor='gold.dark'
      borderRadius={2}
      p={2}
      textAlign='center'
      sx={Array.isArray(sx) ? sx : [sx]}
    >
      <Typography
        variant='baseMd'
        display='inline'
        alignItems='center'
        {...typographyProps}
      >
        {beforeText ? `${beforeText} ` : null}
        {t('general.nextClearingPeriodStart')}{' '}
        {isLoading ? (
          <Skeleton
            variant='rounded'
            sx={{
              bgcolor: 'gold.extraDark',
              display: 'inline-block',
              ml: '1ch',
            }}
            width={200}
            height={21}
          />
        ) : (
          <Typography variant='baseMdBold' {...timeTypographyProps}>
            {formattedNextClearingPeriod.timestamp}{' '}
            {formattedNextClearingPeriod.utcOffset} •{' '}
            {formattedNextClearingPeriod.date}
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

export default NextClearingPeriodInfo
