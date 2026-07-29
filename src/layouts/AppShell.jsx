import {
  BarChart3,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/sessions', label: 'Sessions', icon: UserRound },
  { to: '/payments', label: 'Payments', icon: CircleDollarSign },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const pageLabel = useMemo(() => {
    const active = navigation.find((item) => pathname.startsWith(item.to))
    return active?.label ?? 'Workspace'
  }, [pathname])

  const shell = (
    <aside className="flex h-full w-full max-w-xs flex-col border-r border-white/10 bg-slate-950/90 p-4 backdrop-blur xl:max-w-none">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">CSPMS</p>
          <h1 className="mt-1 text-xl font-semibold text-white">Control center</h1>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-full border border-white/10 p-2 text-slate-400 xl:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'border border-cyan-400/20 bg-cyan-400/10 text-white shadow-lg shadow-cyan-950/30'
                    : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">{user?.name ?? 'Authenticated user'}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{user?.role ?? 'staff'}</p>
        <p className="mt-3 text-sm text-slate-400">{user?.email ?? 'No email available'}</p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${theme === 'light' ? 'theme-light' : ''}`}>
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <div className="hidden w-72 shrink-0 xl:block">{shell}</div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 flex xl:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex-1 bg-slate-950/70 backdrop-blur-sm"
              aria-label="Close sidebar overlay"
            />
            <div className="relative z-50 w-80 max-w-full">{shell}</div>
          </div>
        ) : null}

        <main className="flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:border-white/20 hover:bg-white/5 xl:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Operations</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{pageLabel}</h2>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Manage clients, revenue, schedules, and retention from a single responsive SaaS dashboard.
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:px-8 xl:px-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
