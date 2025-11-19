import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

const useReferralLink = () => {
  const { address } = usePrivyAuthenticated()

  const referralCode = address || ''

  return {
    fullUrl: `${window.location.origin}/referrals/${referralCode}`,
    shortenUrl: `${window.location.host}/referrals/${referralCode}`,
  }
}
export default useReferralLink
