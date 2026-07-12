import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { dashboardPages } from '../config/navigation'
import { AUTH_ENABLED } from '../config/auth'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-gold/15 text-gold-dark ring-1 ring-gold/30'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  ].join(' ')
}

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-6">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <p className="text-sm font-semibold text-neutral-900">Vanguard Motors Hub</p>
            <p className="text-xs text-neutral-500">Sales Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <NavLink to="/" end className={navClass} onClick={() => setMobileOpen(false)}>
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Overview
        </NavLink>

        <p className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Tools
        </p>

        {dashboardPages.map((page) => (
          <NavLink
            key={page.id}
            to={page.path}
            className={navClass}
            onClick={() => setMobileOpen(false)}
          >
            <page.icon className="h-4 w-4 shrink-0" />
            {page.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        {AUTH_ENABLED && (
          <>
            <p className="truncate text-xs text-neutral-500">{user?.email}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-full min-h-screen bg-neutral-100">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-white lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-72 border-r border-border bg-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
