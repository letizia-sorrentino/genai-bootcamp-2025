import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { StudySession } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

export default function StudySessionShow() {
  const { id } = useParams()
  const { data: session, loading, error, request } = useApi<StudySession>()

  useEffect(() => {
    if (id) {
      request(() => api.getStudySession(Number(id)))
    }
  }, [id, request])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!session) return null

  const totalAnswers = session.correctCount + session.incorrectCount
  const successRate = totalAnswers > 0 
    ? Math.round((session.correctCount / totalAnswers) * 100)
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study Session Details</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">Activity</div>
              <p>{session.activityName}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Word Group</div>
              <p>{session.groupName}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <p>{format(new Date(session.startTime), 'PPp')}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <p>{format(new Date(session.endTime), 'PPp')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
              <Progress value={successRate} className="h-2" />
              <p className="mt-1 text-sm text-muted-foreground">{successRate}%</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Items</div>
                <p className="text-2xl font-bold">{session.reviewItemCount}</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Correct</div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {session.correctCount}
                </p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wrong</div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                  {session.incorrectCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 