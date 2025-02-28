import { ReactNode } from "react"
import { Navigation } from "./Navigation"
import { Breadcrumbs } from "./Breadcrumbs"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
} 