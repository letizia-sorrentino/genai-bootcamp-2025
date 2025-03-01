import { Link, useLocation } from 'react-router-dom'
import { useNavigation } from './navigation-context'

export function Breadcrumbs() {
  const location = useLocation()
  const { isCollapsed } = useNavigation()
  const paths = location.pathname.split('/').filter(Boolean)
  
  // If we're on the dashboard, don't show breadcrumbs
  if (location.pathname === '/dashboard') {
    return null
  }

  return (
    <div className="bg-muted/30 border-b">
      <div className={`px-6 py-2 ${isCollapsed ? 'ml-2' : ''}`}>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          {paths.map((path, index) => {
            const to = `/${paths.slice(0, index + 1).join('/')}`
            return (
              <div key={to} className="flex items-center space-x-2">
                <span>/</span>
                <Link to={to} className="capitalize hover:text-foreground">
                  {path.replace(/_/g, ' ')}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 