import { useEffect } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { StudyProgress, QuickStats } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Activity, Trophy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"
import { format } from "date-fns"

export default function Dashboard() {
  const { data: progress } = useApi<StudyProgress>()
  
  // Get stats from Redux store
  const wordStats = useAppSelector(state => state.wordStats.stats)
  const sessionStats = useAppSelector(state => state.sessionStats)

  // Get the latest session stats
  const latestSession = sessionStats.recentSessions[0]
  const hasStats = sessionStats.totalAttempts > 0 || sessionStats.recentSessions.length > 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="blue" asChild>
          <Link to="/study_activities" className="flex items-center">
            Start Studying
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Last Study Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasStats ? (
              <>
                {/* Current Session */}
                {sessionStats.total > 0 && (
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Current Session
                      <span className="text-xs text-muted-foreground">(in progress)</span>
                    </div>
                    <div className="mt-2 flex gap-4">
                      <div className="text-green-600">✓ {sessionStats.correctAnswers} correct</div>
                      <div className="text-red-600">✗ {sessionStats.total - sessionStats.correctAnswers} wrong</div>
                    </div>
                  </div>
                )}

                {/* Last Completed Session */}
                {latestSession && (
                  <div>
                    <div className="font-medium">Last Completed Session</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(latestSession.date), 'PPp')}
                    </div>
                    <div className="mt-2 flex gap-4">
                      <div className="text-green-600">
                        ✓ {Math.round((latestSession.score / 100) * latestSession.total)} correct
                      </div>
                      <div className="text-red-600">
                        ✗ {latestSession.total - Math.round((latestSession.score / 100) * latestSession.total)} wrong
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-muted-foreground">No sessions yet</div>
                <Link 
                  to="/study_activities"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Start your first session <ArrowRight className="ml-1 h-3 w-3 text-blue-600" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestSession ? (
              <div>
                <div className="text-muted-foreground">Words Studied</div>
                <div className="font-medium">{latestSession.total} words</div>
                <div className="mt-2">
                  <div className="text-green-600">
                    ✓ {Math.round((latestSession.score / 100) * latestSession.total)} correct answers
                  </div>
                  <div className="text-red-600">
                    ✗ {latestSession.total - Math.round((latestSession.score / 100) * latestSession.total)} wrong answers
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-muted-foreground">Words Studied</div>
                <div className="font-medium">0 words</div>
                <div className="mt-2">
                  <div className="text-green-600">✓ 0 correct answers</div>
                  <div className="text-red-600">✗ 0 wrong answers</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="text-muted-foreground">Success Rate</div>
                <div className="font-medium">{latestSession ? Math.round(latestSession.score) : 0}%</div>
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground">Total Attempts</div>
                <div className="font-medium">{sessionStats.totalAttempts}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-muted-foreground">Current Session</div>
                <div className="font-medium">{sessionStats.correctAnswers}/{sessionStats.total || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 