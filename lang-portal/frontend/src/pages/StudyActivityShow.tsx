import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StudySessionList } from "@/components/study-session-list"
import { StudyActivity, StudySession, PaginatedResponse } from "@/lib/types/api"

export default function StudyActivityShow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: activity, loading, error, request } = useApi<StudyActivity>()
  const { 
    data: sessions,
    loading: sessionsLoading,
    request: requestSessions 
  } = useApi<PaginatedResponse<StudySession>>()

  useEffect(() => {
    if (id) {
      request(() => api.getStudyActivity(Number(id)))
      requestSessions(() => api.getStudySessions({ 
        activityId: Number(id),
        page: 1
      }))
    }
  }, [id, request, requestSessions])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!activity) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{activity.title}</h1>
        <Button onClick={() => navigate(`/study_activities/${id}/launch`)}>
          Launch Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <img 
              src={activity.thumbnail} 
              alt={activity.title}
              className="w-full rounded-lg aspect-video object-cover"
            />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Description</div>
            <p>{activity.description}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Study Sessions</h2>
        {sessionsLoading ? (
          <div>Loading sessions...</div>
        ) : sessions?.data ? (
          <StudySessionList 
            sessions={sessions.data}
            currentPage={sessions.page}
            totalPages={sessions.totalPages}
            onPageChange={(page) => requestSessions(() => api.getStudySessions({
              activityId: Number(id),
              page
            }))}
            onSort={(column) => requestSessions(() => api.getStudySessions({
              activityId: Number(id),
              page: 1,
              sortBy: String(column),
              sortDirection: 'asc'
            }))}
          />
        ) : null}
      </div>
    </div>
  )
} 