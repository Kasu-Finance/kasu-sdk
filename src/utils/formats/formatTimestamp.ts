import dayjs from '@/dayjs'

type TimestampFormats = 'DD.MM.YYYY' | 'DD.MM.YYYY HH:mm:ss' | 'HH:mm:ss'

function formatTimestamp(
  unixTimestamp: EpochTimeStamp,
  options: { format: TimestampFormats; includeUtcOffset?: false }
): { date: string; timestamp: string }

function formatTimestamp(
  unixTimestamp: EpochTimeStamp,
  options: { format: TimestampFormats; includeUtcOffset: true }
): { date: string; timestamp: string; utcOffset: string }

function formatTimestamp(
  unixTimestamp: EpochTimeStamp,
  options: { format: TimestampFormats; includeUtcOffset?: boolean }
): unknown {
  const { format, includeUtcOffset = false } = options

  const time = dayjs.unix(unixTimestamp)

  const formattedTime = time.format(format)

  const utcOffset = new Intl.NumberFormat('en-US', {
    signDisplay: 'exceptZero',
  }).format(time.utcOffset() / 60)

  const [date, timestamp] = formattedTime.split(' ')

  return {
    date: date || '',
    timestamp: timestamp || '',
    ...(includeUtcOffset && { utcOffset: `UTC${utcOffset}` }),
  }
}

export default formatTimestamp
