import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { FULL_DATE_WITH_TIME } from '@/constants'

dayjs.extend(utc)

const formatTimestampWithOffset = (
  timestamp: number,
  offset: number = 0
): string => {
  let date = dayjs.unix(timestamp).utc()

  if (offset !== 0) {
    date = date.add(offset, 'hour')
  }

  const utcPart = offset === 0 ? 'UTC' : `UTC${offset > 0 ? '+' : ''}${offset}`
  const formattedDate = date.format(`${FULL_DATE_WITH_TIME} [${utcPart}]`)

  return formattedDate
}

export default formatTimestampWithOffset
