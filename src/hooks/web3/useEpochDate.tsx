import useNextEpochTime from '@/hooks/locking/useNextEpochTime'

import { TimeConversions } from '@/utils'

const useEpochDate = () => {
  const { nextEpochTime } = useNextEpochTime()

  const getEpochDate = (targetEpoch: string, currentEpoch: string) => {
    const currentEpochTime = nextEpochTime - TimeConversions.SECONDS_PER_WEEK
    const epochDiff = parseInt(targetEpoch) - parseInt(currentEpoch) // negative if 'targetEpoch' is in the past
    const targetEpochStartTime =
      currentEpochTime + epochDiff * TimeConversions.SECONDS_PER_WEEK
    return {
      startTime: targetEpochStartTime,
      endTime: targetEpochStartTime + TimeConversions.SECONDS_PER_WEEK,
    }
  }

  return {
    getEpochDate,
  }
}

export default useEpochDate
