import { useEffect, useMemo, useState } from 'react'

import dayjs from '@/dayjs'
import { TimeConversions } from '@/utils'

type CountdownOptionsBase = {
  format?: string
  intervalMs?: number
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

const formatToNearestUnit = (timeLeft: number, defaultUnit: string) => {
  if (!Math.floor(timeLeft)) {
    return defaultUnit
  }

  const timeLeftInSeconds = timeLeft / 1000

  let output: string
  let suffix: string

  switch (true) {
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_DAY:
      output = dayjs.duration(timeLeft).format('D')
      suffix = 'day'
      break
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_HOUR:
      output = dayjs.duration(timeLeft).format('H')
      suffix = 'hour'
      break
    case timeLeftInSeconds > TimeConversions.SECONDS_PER_MINUTE:
      output = dayjs.duration(timeLeft).format('m')
      suffix = 'minute'
      break
    default:
      output = dayjs.duration(timeLeft).format('s')
      suffix = 'second'
  }

  const isSingular = output === '1'

  if (!isSingular) {
    suffix += 's'
  }

  return `${output} ${suffix}`
}

const useCountdown = (
  futureTimestamp: EpochTimeStamp,
  options: CountdownOptions = {}
) => {
  const { format = 'DD:HH:mm', intervalMs = 1000 } = options

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
    ? formatToNearestUnit(timeLeft, options.defaultUnit ?? '0 days')
    : dayjs.duration(timeLeft).format(format)
}

export default useCountdown
