import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'

const useAvailableKsuBonus = () => {
  const sdk = useSdk()

  const { data, error } = useSWR(
    sdk ? ['availableKsuBonus', sdk] : null,
    async ([_, sdk]) => sdk.Locking.getAvailableKsuBonus()
  )

  return {
    availableKsuBonus: data,
    error,
    isLoading: !data && !error,
  }
}

export default useAvailableKsuBonus
