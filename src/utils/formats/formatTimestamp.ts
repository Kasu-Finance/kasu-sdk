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

  let date = ''
  let timestamp = ''

  switch (format) {
    case 'DD.MM.YYYY': {
      date = formattedTime
      break
    }
    case 'DD.MM.YYYY HH:mm:ss': {
      const split = formattedTime.split(' ')

      date = split[0]
      timestamp = split[1]
      break
    }
    case 'HH:mm:ss': {
      timestamp = formattedTime
      break
    }
  }

  return {
    date,
    timestamp,
    ...(includeUtcOffset && { utcOffset: `UTC${utcOffset}` }),
  }
}

export default formatTimestamp
