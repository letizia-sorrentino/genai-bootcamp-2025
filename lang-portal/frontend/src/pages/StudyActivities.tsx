import { useEffect } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { StudyActivity } from "@/lib/types/api"
import { StudyActivityCard } from "@/components/ui/activity-card"
import { useNavigate } from "react-router-dom"

export default function StudyActivities() {
  const navigate = useNavigate()
  const { data: activities, loading, error, request } = useApi<StudyActivity[]>()

  useEffect(() => {
    request(() => api.getStudyActivities())
  }, [request])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!activities) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study Activities</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map(activity => (
          <StudyActivityCard
            key={activity.id}
            title={activity.title}
            thumbnail={activity.thumbnail}
            onView={() => navigate(`/study_activities/${activity.id}`)}
            onLaunch={() => navigate(activity.launchUrl)}
          />
        ))}
      </div>
    </div>
  )
} 