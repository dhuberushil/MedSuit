import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, Calendar, FileText,
  BarChart3, LogOut, Stethoscope, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: Role[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'doctor', 'receptionist'] },
  { label: 'Patients', href: '/patients', icon: <Users size={20} />, roles: ['admin', 'doctor', 'receptionist'] },
  { label: 'Appointments', href: '/appointments', icon: <Calendar size={20} />, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { label: 'Doctors', href: '/doctors', icon: <Stethoscope size={20} />, roles: ['admin', 'receptionist', 'patient'] },
  { label: 'Billing', href: '/billing', icon: <FileText size={20} />, roles: ['admin', 'receptionist', 'patient'] },
  { label: 'Reports', href: '/reports', icon: <BarChart3 size={20} />, roles: ['admin'] },
  { label: 'User Management', href: '/users', icon: <UserPlus size={20} />, roles: ['admin'] },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const filteredItems = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  )

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            H
          </div>
          <span className="text-lg font-bold">HSuit</span>
        </div>
        <button className="lg:hidden" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border bg-card p-2 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card transition-transform lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-border bg-card">
        {sidebarContent}
      </aside>
    </>
  )
}
