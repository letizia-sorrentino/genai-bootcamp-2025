import { Link, useLocation } from 'react-router-dom'

export function Breadcrumbs() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  return (
    <div className="bg-muted">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          {paths.map((path, index) => {
            const to = `/${paths.slice(0, index + 1).join('/')}`
            return (
              <div key={to} className="flex items-center space-x-2">
                <span>/</span>
                <Link to={to} className="capitalize hover:text-foreground">
                  {path.replace('_', ' ')}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 