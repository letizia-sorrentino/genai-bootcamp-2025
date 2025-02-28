import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { useTheme } from "@/components/theme-provider"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { theme } = useTheme()
  
  return (
    <div className={theme}>
      <Navigation />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
} 