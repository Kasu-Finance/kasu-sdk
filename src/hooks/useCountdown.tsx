import { useEffect, useMemo, useState } from 'react'

import dayjs from '@/dayjs'

const useCountdown = (
  futureTimestamp: EpochTimeStamp,
  format: string = 'DD:HH:mm',
  intervalMs: number = 1000
) => {
  const initialState = useMemo(
    () =>
      format
        .split(':')
        .map(() => '0')
        .join(':'),
    [format]
  )

  const [timeLeft, setTimeLeft] = useState(initialState)

  useEffect(() => {
    const interval = setInterval(() => {
      const milliSecondDiff = dayjs.unix(futureTimestamp).diff()

      if (milliSecondDiff <= 0) {
        setTimeLeft(initialState)
        clearInterval(interval)
        return
      }

      setTimeLeft(dayjs.duration(milliSecondDiff).format(format))
    }, intervalMs)

    return () => clearInterval(interval)
  }, [initialState, futureTimestamp, format, intervalMs])

  return timeLeft
}

export default useCountdown
