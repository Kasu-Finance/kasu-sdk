import { unix } from 'dayjs'

const formatToDateTimeUtc = (timestamp: number): string => {
  const date = unix(timestamp)
  const offset = date.utcOffset() / 60
  const formattedDate = date.format('DD.MM.YYYY HH:mm:ss')

  return `${formattedDate} UTC${offset >= 0 ? '+' : ''}${offset}`
}

export default formatToDateTimeUtc
