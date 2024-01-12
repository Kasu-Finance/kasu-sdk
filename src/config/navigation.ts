import { Routes } from '@/config/routes'

import { MenuItem } from '@/types/menu.items'

export const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Home',
    href: Routes.home.root.url,
  },
  {
    title: 'Lend',
    href: Routes.lend.root.url,
  },
  {
    title: 'Borrow',
    href: Routes.borrow.root.url,
  },
  {
    title: 'Docs',
    href: Routes.docs.root.url,
  },
  {
    title: 'Locking',
    href: Routes.locking.root.url,
  },
  {
    title: 'Account',
    href: Routes.account.root.url,
  },
]
