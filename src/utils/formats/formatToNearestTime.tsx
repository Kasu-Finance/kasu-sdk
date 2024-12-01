import dayjs from '@/dayjs'
import TimeConversions from '@/utils/timeConversions'

const formatToNearestTime = (timeLeft: number, defaultUnit?: string) => {
  if (Math.floor(timeLeft) <= 0) {
    return defaultUnit ?? '0'
  }

  const timeLeftInSeconds = timeLeft / 1000

  let output: number
  let suffix: string

  switch (true) {
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_YEAR:
      output = dayjs.duration(timeLeft).asYears()
      suffix = 'year'
      break
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_MONTH:
      output = dayjs.duration(timeLeft).asMonths()
      suffix = 'month'
      break
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_DAY:
      output = dayjs.duration(timeLeft).asDays()
      suffix = 'day'
      break
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_HOUR:
      output = dayjs.duration(timeLeft).asHours()
      suffix = 'hour'
      break
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_MINUTE:
      output = dayjs.duration(timeLeft).asMinutes()
      suffix = 'minute'
      break
    default:
      output = dayjs.duration(timeLeft).asSeconds()
      suffix = 'second'
  }

  const isSingular = output <= 1

  if (!isSingular) {
    suffix += 's'
  }

  // using Math.ceil because seconds after a month can vary
  return `${Math.ceil(output)} ${suffix}`
}

export default formatToNearestTime
