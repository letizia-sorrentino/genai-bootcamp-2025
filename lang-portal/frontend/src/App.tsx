import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Providers } from "@/components/providers"

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <ThemeProvider defaultTheme="system">
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </Providers>
    </ErrorBoundary>
  )
} 