import { redirect } from 'next/navigation'

import { Routes } from '@/config/routes'

type PageProps = {
  params: Promise<{ referralCode: string }>
}

const Referral = async ({ params }: PageProps) => {
  const { referralCode } = await params

  return redirect(`${Routes.lending.root.url}?referralCode=${referralCode}`)
}

export default Referral
