import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { Word } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioPlayer } from "@/components/ui/audio-player"
import { Progress } from "@/components/ui/progress"
import { DetailsSkeleton } from "@/components/skeletons/details-skeleton"
import { toast } from "sonner"

export default function WordShow() {
  const { id } = useParams()
  const { data: word, loading, error, request } = useApi<Word>()

  useEffect(() => {
    if (id) {
      request(() => api.getWord(Number(id)))
    }
  }, [id, request])

  if (loading) return <DetailsSkeleton />

  if (error) {
    toast.error("Failed to update word")
    return <div>Error: {error}</div>
  }
  if (!word) return null

  const totalAttempts = word.correctCount + word.wrongCount
  const successRate = totalAttempts > 0 
    ? Math.round((word.correctCount / totalAttempts) * 100)
    : 0

  toast.success("Word updated successfully")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{word.italian}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Word Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">English</div>
              <p className="text-xl">{word.english}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Audio</div>
              <AudioPlayer src={word.audioUrl} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
              <Progress value={successRate} className="h-2" />
              <p className="mt-1 text-sm text-muted-foreground">{successRate}%</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <div className="text-sm text-muted-foreground">Correct</div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {word.correctCount}
                </p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wrong</div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                  {word.wrongCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 