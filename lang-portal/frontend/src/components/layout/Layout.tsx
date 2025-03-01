import { ReactNode } from "react"
import { Navigation } from "./Navigation"
import { Breadcrumbs } from "./Breadcrumbs"
import { NavigationProvider } from "./navigation-context"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <NavigationProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Breadcrumbs />
          <main className="px-6 py-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </NavigationProvider>
  )
} 