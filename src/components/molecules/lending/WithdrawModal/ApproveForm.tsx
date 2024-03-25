import { Box, Button, Divider, Typography } from '@mui/material'
import React, { memo } from 'react'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import useTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import { ChevronRightIcon, EditIcon } from '@/assets/icons'

import { extractDateAndUtcOffset, formatTimestampWithOffset } from '@/utils'

interface ApproveFormProps {
  handleAdjust: () => void
  handleConfirm: () => void
}

const ApproveForm: React.FC<ApproveFormProps> = ({
  handleAdjust,
  handleConfirm,
}) => {
  const { t } = useTranslation()

  const { nextEpochTime } = useNextEpochTime()

  const formattedDate = formatTimestampWithOffset(nextEpochTime || 0, 1)
  const { date, time, format, offset } = extractDateAndUtcOffset(formattedDate)

  return (
    <Box mt={3} pl={1} pr={1}>
      <Typography variant='subtitle2' color='textPrimary' mb={0.5}>
        {t('lending.withdraw.epochEnds')}
      </Typography>
      <Divider />
      <Box mt={0.5}>
        <Typography variant='h6' component='span' display='block'>
          <Countdown
            endTime={nextEpochTime ?? 0}
            format='D:HH:mm'
            render={(countDown) => {
              const parts = countDown.split(':')

              return `${parts[0]} ${t('time.days')} • ${parts[1]} ${t(
                'time.hours'
              )} • ${parts[2]} ${t('time.minutes')}`
            }}
          />
        </Typography>
        <Typography variant='body1' color='grey.500'>
          {date} • {time}{' '}
          <span style={{ fontSize: 12 }}>
            {format}
            {offset}
          </span>
        </Typography>
      </Box>

      <Box display='flex' flexDirection='column' alignItems='center' mt={2}>
        <Box width='70%' textAlign='center'>
          <Typography variant='body2'>
            {t('lending.withdraw.withdrawalSchedule')}
          </Typography>
        </Box>

        <Box display='flex' justifyContent='center' mt={2}>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleAdjust}
          >
            {t('lending.withdraw.button.adjust')}
          </Button>

          <Button
            sx={{ ml: 2 }}
            variant='contained'
            endIcon={<ChevronRightIcon />}
            onClick={handleConfirm}
          >
            {t('lending.withdraw.button.confirm')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(ApproveForm)
