import { useEffect } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { LastStudySession, StudyProgress, QuickStats } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Activity, Trophy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const { data: lastSession } = useApi<LastStudySession>()
  const { data: progress } = useApi<StudyProgress>()
  const { data: stats } = useApi<QuickStats>()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
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
              <Clock className="h-5 w-5" />
              Last Study Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastSession ? (
              <div>
                <div className="font-medium">{lastSession.activityName}</div>
                <div className="text-sm text-muted-foreground">{lastSession.lastAccessed}</div>
                <div className="mt-2 flex gap-4">
                  <div className="text-green-600">✓ {lastSession.correctCount} correct</div>
                  <div className="text-red-600">✗ {lastSession.incorrectCount} wrong</div>
                </div>
                <Link 
                  to={`/word_groups/${lastSession.groupId}`}
                  className="mt-4 text-sm text-blue-600 hover:underline inline-flex items-center"
                >
                  View Group <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-muted-foreground">No sessions yet</div>
                <Link 
                  to="/study_activities"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Start your first session <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress ? (
              <div>
                <div className="text-muted-foreground">Total Words Studied</div>
                <div className="font-medium">{progress.wordsStudied} / {progress.totalWords}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-muted-foreground">Start studying to see your progress</div>
                <Link 
                  to="/word_groups"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Browse word groups <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Success Rate</div>
                  <div className="font-medium">{stats.successRate}%</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Study Sessions</div>
                  <div className="font-medium">{stats.totalSessions}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Active Groups</div>
                  <div className="font-medium">{stats.activeGroups}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-muted-foreground">Study Streak</div>
                  <div className="font-medium">{stats.studyStreak} days</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-muted-foreground">Complete sessions to see your stats</div>
                <Link 
                  to="/study_activities"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Try an activity <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 