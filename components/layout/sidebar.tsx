'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-sidebar shrink-0">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
        <span className="font-semibold text-sidebar-foreground">ConsultPilot</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-xs text-sidebar-foreground/50">Module 1 · Foundation</p>
      </div>
    </aside>
  )
}
