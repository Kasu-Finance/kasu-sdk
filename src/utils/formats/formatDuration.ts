import type { Dayjs } from 'dayjs'

import dayjs from '@/dayjs'

type durationConfigProps = {
  years?: boolean
  months?: boolean
  days?: boolean
}

const parseTimestamp = (timestamp: number | string): Dayjs => {
  if (typeof timestamp === 'number') {
    // Create a Day.js object from Unix timestamp
    return dayjs.unix(timestamp)
  } else {
    // Create a Day.js object from ISO date string
    return dayjs(timestamp)
  }
}

const formatDuration = (
  timestamp: number | string,
  durationConfig: durationConfigProps = {
    years: true,
    months: true,
    days: true,
  }
): string => {
  const date = parseTimestamp(timestamp)
  const now = dayjs()

  const durationFromDate = dayjs.duration(now.diff(date))

  const durationUnits = [
    {
      unit: 'year',
      value: durationFromDate.years(),
      include: durationConfig.years,
    },
    {
      unit: 'month',
      value: durationFromDate.months(),
      include: durationConfig.months,
    },
    {
      unit: 'day',
      value: durationFromDate.days(),
      include: durationConfig.days,
    },
  ]

  const parts = durationUnits
    // Filter based on inclusion config
    .filter(({ include }) => include)
    .map(({ unit, value, include }) => {
      // This caters for when value is 0 but should still be included
      return include ? `${value} ${unit}${value !== 1 ? 's' : ''}` : ''
    })
    // Ensure no empty strings are included
    .filter((part) => part !== '')

  return parts.join(' • ')
}

export default formatDuration
