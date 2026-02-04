import { Routes } from '@/config/routes'

type NavItemType = {
  to: string
  label: string
  accountRequired?: boolean
  /** If true, this item is hidden on Lite deployments (chains without KSU token) */
  requiresFullDeployment?: boolean
}

export const NAV_ITEMS: NavItemType[] = [
  {
    label: 'Lending',
    to: Routes.lending.root.url,
  },

  {
    label: 'KASU Locking',
    to: Routes.locking.root.url,
    requiresFullDeployment: true, // Hide on Lite deployments
  },
  {
    label: 'My Portfolio',
    to: Routes.portfolio.root.url,
    accountRequired: true,
  },
]
