import useKasuSDK from '@/hooks/useKasuSDK'

const useProjectedApy = () => {
  const sdk = useKasuSDK()

  return sdk.Locking.getProjectedApy()
}

export default useProjectedApy
