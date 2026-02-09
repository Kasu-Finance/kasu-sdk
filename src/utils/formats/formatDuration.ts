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
  // Handle missing, zero, or invalid timestamps
  // Zero timestamp (1970-01-01) is almost certainly invalid data
  if (!timestamp || timestamp === 0 || timestamp === '0') {
    return 'N/A'
  }

  const date = parseTimestamp(timestamp)
  const now = dayjs()

  // Additional check: if timestamp results in a date before year 2000, it's likely invalid
  // (Kasu didn't exist before 2020, so any earlier date is incorrect data)
  if (date.year() < 2000) {
    return 'N/A'
  }

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
