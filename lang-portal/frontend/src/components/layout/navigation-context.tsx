import { createContext, useContext, useState, ReactNode } from "react"

type NavigationContextType = {
  isCollapsed: boolean
  toggleCollapsed: () => void
  setCollapsed: (collapsed: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapsed = () => setIsCollapsed(prev => !prev)
  const setCollapsed = (collapsed: boolean) => setIsCollapsed(collapsed)

  return (
    <NavigationContext.Provider value={{ isCollapsed, toggleCollapsed, setCollapsed }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
} 