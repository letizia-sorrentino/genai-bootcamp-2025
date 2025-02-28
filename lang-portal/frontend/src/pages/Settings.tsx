import { api } from "@/lib/api-client"
import { ResetDialog } from "@/components/settings/reset-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <ThemeToggle />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Reset Options</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Reset Study History</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will reset all study progress, keeping your words and groups intact.
              </p>
              <ResetDialog
                title="Reset Study History"
                description="This action cannot be undone. All study progress will be reset, but your words and groups will remain."
                trigger="Reset History"
                onConfirm={api.resetHistory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 