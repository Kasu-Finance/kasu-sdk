import { Routes } from '@/config/routes'

type NavItemType = {
  to: string
  label: string
  accountRequired?: boolean
}

export const NAV_ITEMS: NavItemType[] = [
  {
    label: 'Lending',
    to: Routes.lending.root.url,
  },

  {
    label: 'KASU Locking',
    to: Routes.locking.root.url,
  },
  {
    label: 'My Portfolio',
    to: Routes.portfolio.root.url,
    accountRequired: true,
  },
]
