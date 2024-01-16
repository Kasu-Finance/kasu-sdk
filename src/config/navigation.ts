import { Routes } from '@/config/routes'

type NavItemType = {
  to: string
  label: string
}

export const NAV_ITEMS: NavItemType[] = [
  {
    label: 'Lending',
    to: Routes.lend.root.url,
  },

  {
    label: 'Locking',
    to: Routes.locking.root.url,
  },
  {
    label: 'Docs',
    to: Routes.docs.root.url,
  },
]
