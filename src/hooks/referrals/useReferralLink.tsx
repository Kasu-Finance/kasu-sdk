import { useAccount } from 'wagmi'

const useReferralLink = () => {
  const { address } = useAccount()

  const referralCode = address || ''

  return {
    fullUrl: `${window.location.origin}/referrals/${referralCode}`,
    shortenUrl: `${window.location.host}/referrals/${referralCode}`,
  }
}
export default useReferralLink
