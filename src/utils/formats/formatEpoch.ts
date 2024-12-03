import dayjs from '@/dayjs'

const formatEpoch = (
  epochDuration: number,
  unit?: 'year' | 'month' | 'week' | 'day'
) => {
  if (unit) {
    const formatted = dayjs.duration(epochDuration, 'weeks').as(unit)

    return `${formatted.toFixed(0)} ${unit}${formatted > 1 ? 's' : ''}`
  }

  return dayjs.duration(epochDuration, 'weeks').humanize(true)
}

export default formatEpoch
