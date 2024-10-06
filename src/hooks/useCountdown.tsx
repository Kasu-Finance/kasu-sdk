import { useEffect, useMemo, useState } from 'react'

import dayjs from '@/dayjs'
import { formatToNearestTime } from '@/utils'

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
    ? formatToNearestTime(timeLeft, options.defaultUnit ?? '0 days')
    : dayjs.duration(timeLeft).format(format)
}

export default useCountdown
