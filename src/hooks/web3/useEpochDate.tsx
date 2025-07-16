import useNextEpochTime from '@/hooks/locking/useNextEpochTime'

import { TimeConversions } from '@/utils'

const useEpochDate = () => {
  const { nextEpochTime } = useNextEpochTime()

  const getEpochDate = (targetEpoch: string, currentEpoch: string) => {
    const currentEpochStartTime =
      nextEpochTime - TimeConversions.SECONDS_PER_WEEK

    const epochDiff = parseInt(currentEpoch) - parseInt(targetEpoch)

    const epochDiffInSeconds = epochDiff * TimeConversions.SECONDS_PER_WEEK

    const targetEpochStartTime = currentEpochStartTime - epochDiffInSeconds

    const targetEpochEndTime =
      targetEpochStartTime + TimeConversions.SECONDS_PER_WEEK

    return {
      startTime: targetEpochStartTime,
      endTime: targetEpochEndTime,
    }
  }

  return {
    getEpochDate,
  }
}

export default useEpochDate
