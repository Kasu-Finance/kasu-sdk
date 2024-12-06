import { Box, Skeleton, Typography } from '@mui/material'

import useNextEpochTime from '@/hooks/locking/useNextEpochTime'
import getTranslation from '@/hooks/useTranslation'

import { formatTimestamp } from '@/utils'

type EpochEndInfoProps = {
  beforeText?: string
}

const EpochEndInfo: React.FC<EpochEndInfoProps> = ({ beforeText }) => {
  const { t } = getTranslation()

  const { nextEpochTime, isLoading } = useNextEpochTime()

  const formattedNextEpochTime = formatTimestamp(nextEpochTime, {
    format: 'DD.MM.YYYY HH:mm:ss',
    includeUtcOffset: true,
  })

  return (
    <Box bgcolor='gold.dark' borderRadius={2} p={2} textAlign='center'>
      <Typography variant='baseMd' alignItems='center'>
        {beforeText ? `${beforeText} ` : null}
        {t('modals.cancelWithdrawal.epochEnds')}
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
          <Typography variant='baseMdBold' display='inline'>
            {' '}
            {formattedNextEpochTime.timestamp}{' '}
            {formattedNextEpochTime.utcOffset} • {formattedNextEpochTime.date}
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

export default EpochEndInfo
