import { Link, useLocation } from "react-router-dom"

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/study_activities', label: 'Study Activities' },
  { href: '/words', label: 'Words' },
  { href: '/groups', label: 'Word Groups' },
  { href: '/study_sessions', label: 'Study Sessions' },
  { href: '/settings', label: 'Settings' }
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center space-x-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-3 py-2 rounded-md ${
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
} 