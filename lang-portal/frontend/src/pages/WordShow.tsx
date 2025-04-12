import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { Word } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioPlayer } from "@/components/ui/audio-player"
import { Progress } from "@/components/ui/progress"
import { DetailsSkeleton } from "@/components/skeletons/details-skeleton"
import { useAppSelector } from "@/store/hooks"
import { Button } from "@/components/ui/button"

export default function WordShow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: word, loading, error, request } = useApi<Word>()
  
  // Get word stats from Redux store
  const wordStats = useAppSelector(state => state.wordStats.stats)
  const currentWordStats = id ? wordStats[parseInt(id)] : null

  useEffect(() => {
    if (id) {
      request(() => api.getWord(Number(id)))
    }
  }, [id, request])

  if (loading) return <DetailsSkeleton />

  if (error || !word) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-xl">Word not found</p>
        <Button onClick={() => navigate('/study_activities/word-quiz')}>
          Back to Quiz
        </Button>
      </div>
    )
  }

  // Use stats from Redux store if available, otherwise use zeros
  const stats = currentWordStats || { correct_count: 0, wrong_count: 0 }
  const totalAttempts = stats.correct_count + stats.wrong_count
  const successRate = totalAttempts > 0 
    ? Math.round((stats.correct_count / totalAttempts) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{word.italian}</h1>
        <Button onClick={() => navigate('/study_activities/word-quiz')}>
          Back to Quiz
        </Button>
      </div>

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
            {word.audio_url && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Audio</div>
                <AudioPlayer src={word.audio_url} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Progress</CardTitle>
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
                  {stats.correct_count}
                </p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wrong</div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                  {stats.wrong_count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 