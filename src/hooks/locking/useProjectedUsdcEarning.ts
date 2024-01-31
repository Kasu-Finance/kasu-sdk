import useKasuSDK from '@/hooks/useKasuSDK'

const useProjectedUsdcEarning = () => {
  const sdk = useKasuSDK()

  return sdk.Locking.getProjectedUSDC()
}

export default useProjectedUsdcEarning
