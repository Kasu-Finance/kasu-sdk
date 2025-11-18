import useSdk from '@/hooks/context/useSdk'

const useProjectedUsdcEarning = () => {
  const sdk = useSdk()

  return sdk ? sdk.Locking.getProjectedUSDC() : '0'
}

export default useProjectedUsdcEarning
