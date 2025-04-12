import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { StudyActivity, StudySession, PaginatedResponse } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppSelector } from "@/store/hooks"

export default function StudyActivityShow() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sessionStats = useAppSelector(state => state.sessionStats)

  const { data: activity, loading: activityLoading, error: activityError, request: requestActivity } = 
    useApi<StudyActivity>()

  const { data: sessions, loading: sessionsLoading, request: requestSessions } = 
    useApi<PaginatedResponse<StudySession>>()

  useEffect(() => {
    if (!id) {
      navigate('/study_activities')
      return
    }

    // Fetch activity details
    requestActivity(() => api.getStudyActivity(id))
    // Fetch sessions
    requestSessions(() => api.getStudySessions({ activityId: parseInt(id), page: 1 }))
  }, [id, requestActivity, requestSessions, navigate])

  if (activityLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading activity...</p>
      </div>
    )
  }

  if (activityError || !activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-xl">Activity not found</p>
        <Button onClick={() => navigate('/study_activities')}>
          Back to Activities
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{activity.title}</h1>
        <Button onClick={() => navigate(activity.launchUrl)}>
          Launch Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About this Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{activity.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold">Total Attempts</h3>
              <p className="text-2xl">{sessionStats.totalAttempts}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Correct Answers</h3>
              <p className="text-2xl">{sessionStats.correctAnswers}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Average Score</h3>
              <p className="text-2xl">{Math.round(sessionStats.averageScore)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionStats.recentSessions.length > 0 ? (
            <ul className="space-y-4">
              {sessionStats.recentSessions.map((session, index) => (
                <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="text-gray-600">{formatDate(session.date)}</span>
                  <div className="text-right">
                    <span className="font-semibold">{Math.round(session.score)}%</span>
                    <span className="text-sm text-gray-500 ml-2">({session.total} words)</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No sessions yet. Start practicing to see your progress!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 