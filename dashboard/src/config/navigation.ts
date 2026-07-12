import type { LucideIcon } from 'lucide-react'
import { Handshake } from 'lucide-react'

export type DashboardPage = {
  id: string
  label: string
  description: string
  path: string
  icon: LucideIcon
}

export const dashboardPages: DashboardPage[] = [
  // Daily Report is hidden until it's ready — restore the entry here to re-enable.
  {
    id: 'close-deal',
    label: 'Close Deal',
    description: 'Match leads and close WhatsApp deals.',
    path: '/close-deal',
    icon: Handshake,
  },
]

export function findPageByPath(pathname: string) {
  return dashboardPages.find((page) => page.path === pathname)
}
