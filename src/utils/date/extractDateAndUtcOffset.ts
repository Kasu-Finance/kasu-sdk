const extractDateAndUtcOffset = (
  dateTime: string
): { date: string; time: string; format: string; offset: string } => {
  const dateTimeUtcPattern =
    /(\d{2}\.\d{2}\.\d{4}) (\d{2}:\d{2}:\d{2}) (UTC[+-]?\d*)/
  const match = dateTime.match(dateTimeUtcPattern)

  if (match) {
    const date = match[1]
    const time = match[2]
    const formatAndOffset = match[3]

    const format = formatAndOffset.substring(0, 3)
    let offset = formatAndOffset.substring(3)

    if (!offset) {
      offset = ''
    }

    return { date, time, format, offset }
  }

  return {
    date: '',
    time: '',
    format: 'UTC',
    offset: '',
  }
}

export default extractDateAndUtcOffset
