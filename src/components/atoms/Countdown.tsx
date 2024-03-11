import { ReactNode } from 'react'

import useCountdown from '@/hooks/useCountdown'

type CountdownProps = {
  endTime: EpochTimeStamp
  format?: string
  intervalMs?: number
  render?: (countDown: string) => ReactNode
}

const Countdown: React.FC<CountdownProps> = ({
  endTime,
  format,
  intervalMs,
  render,
}) => {
  const countDown = useCountdown(endTime, {
    format,
    intervalMs,
  })

  return render?.(countDown) ?? countDown
}

export default Countdown
