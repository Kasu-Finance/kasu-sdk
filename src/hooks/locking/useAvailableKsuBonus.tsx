import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useAvailableKsuBonus = () => {
  const sdk = useKasuSDK()

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
