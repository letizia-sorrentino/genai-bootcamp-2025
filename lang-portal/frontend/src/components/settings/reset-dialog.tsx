import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ResetDialogProps {
  title: string
  description: string
  onConfirm: () => Promise<void>
  trigger: string
}

export function ResetDialog({ title, description, onConfirm, trigger }: ResetDialogProps) {
  const [open, setOpen] = useState(false)
  const [validation, setValidation] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (validation !== "reset me") return
    
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Reset failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{trigger}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            <div className="mt-4">
              <p className="text-sm mb-2">Type "reset me" to confirm:</p>
              <Input
                value={validation}
                onChange={(e) => setValidation(e.target.value)}
                placeholder="reset me"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={validation !== "reset me" || loading}
          >
            {loading ? "Resetting..." : "Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 