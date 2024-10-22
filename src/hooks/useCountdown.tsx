import { Duration } from 'dayjs/plugin/duration'
import { useEffect, useMemo, useState } from 'react'

import dayjs from '@/dayjs'
import { formatToNearestTime } from '@/utils'

type CountdownOptionsBase = {
  format?: string
  intervalMs?: number
  largestUnit?: string
}

type WithNearestUnit = {
  toNearestUnit?: false
}

type WithoutNearestUnit = {
  toNearestUnit: true
  defaultUnit?: string
}

type CountdownOptions = CountdownOptionsBase &
  (WithNearestUnit | WithoutNearestUnit)

const formatTotals = (
  timeLeft: Duration,
  format: string,
  largestUnit: string
) => {
  const units = format.split(':')

  const unit = units.find((unit) => unit.includes(largestUnit)) ?? units[0]

  let largestTimeLeft: number

  if (unit.includes('Y')) {
    largestTimeLeft = timeLeft.asYears()
  } else if (unit.includes('M')) {
    largestTimeLeft = timeLeft.asMonths()
  } else if (unit.includes('D')) {
    largestTimeLeft = timeLeft.asDays()
  } else if (unit.includes('H')) {
    largestTimeLeft = timeLeft.asHours()
  } else if (unit.includes('m')) {
    largestTimeLeft = timeLeft.asMinutes()
  } else {
    largestTimeLeft = timeLeft.asSeconds()
  }

  const formatWithoutLargestUnit = format.replace(unit, '')

  return (
    Math.floor(largestTimeLeft).toString() +
    timeLeft.format(formatWithoutLargestUnit)
  )
}

const useCountdown = (
  futureTimestamp: EpochTimeStamp,
  options: CountdownOptions = {}
) => {
  const { format = 'DD:HH:mm', intervalMs = 1000, largestUnit = 'D' } = options

  const initialState = useMemo(() => 0, [])

  const [timeLeft, setTimeLeft] = useState(initialState)

  useEffect(() => {
    const updateTime = (clearInterval?: () => void) => {
      const milliSecondDiff = dayjs.unix(futureTimestamp).diff()

      if (milliSecondDiff <= 0) {
        setTimeLeft(initialState)
        clearInterval && clearInterval()
        return
      }

      setTimeLeft(milliSecondDiff)
    }

    updateTime()

    const interval = setInterval(() => {
      updateTime(() => clearInterval(interval))
      return
    }, intervalMs)

    return () => clearInterval(interval)
  }, [initialState, futureTimestamp, format, intervalMs])

  return options.toNearestUnit
    ? formatToNearestTime(timeLeft, options.defaultUnit ?? '0 days')
    : formatTotals(dayjs.duration(timeLeft), format, largestUnit)
}

export default useCountdown
