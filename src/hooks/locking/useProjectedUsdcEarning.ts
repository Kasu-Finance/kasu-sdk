import useKasuSDK from '@/hooks/useKasuSDK'

const useProjectedUsdcEarning = () => {
  const sdk = useKasuSDK()

  return sdk ? sdk.Locking.getProjectedUSDC() : '0'
}

export default useProjectedUsdcEarning
