import { Link, useLocation } from "react-router-dom"
import { 
  HomeIcon, 
  BookOpenIcon, 
  BookmarkIcon, 
  LayersIcon, 
  ClockIcon, 
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon
} from "lucide-react"
import { useTheme } from "../theme-provider"
import { useNavigation } from "./navigation-context"

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/study_activities', label: 'Study Activities', icon: BookOpenIcon },
  { href: '/words', label: 'Words', icon: BookmarkIcon },
  { href: '/groups', label: 'Word Groups', icon: LayersIcon },
  { href: '/study_sessions', label: 'Sessions', icon: ClockIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon }
]

export function Navigation() {
  const location = useLocation()
  const { theme } = useTheme()
  const { isCollapsed, toggleCollapsed } = useNavigation()
  
  // Determine if we're using dark mode (either explicitly or via system preference)
  const isDarkMode = 
    theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <nav 
      className={`${isCollapsed ? 'w-16' : 'w-64'} ${isDarkMode ? 'bg-black' : 'bg-gray-900'} text-white min-h-screen flex flex-col transition-all duration-300 relative`}
    >
      {/* App Title and Toggle Button */}
      <div className={`p-6 border-b border-gray-800 flex items-center justify-between`}>
        {isCollapsed ? (
          <MenuIcon className="h-6 w-6 mx-auto" />
        ) : (
          <>
            <h1 className="text-xl font-bold">Ciao Italia</h1>
            <button 
              onClick={toggleCollapsed}
              className="bg-gray-200 text-gray-800 rounded-full p-1 shadow-md hover:bg-gray-300"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </>
        )}
        
        {isCollapsed && (
          <button 
            onClick={toggleCollapsed}
            className="bg-gray-200 text-gray-800 rounded-full p-1 shadow-md hover:bg-gray-300 absolute top-6 left-1/2 transform -translate-x-1/2"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 py-6">
        <ul className="space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-sm ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : `hover:bg-${isDarkMode ? 'gray-800' : 'gray-700'}`
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5`} />
                  {!isCollapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  )
} 