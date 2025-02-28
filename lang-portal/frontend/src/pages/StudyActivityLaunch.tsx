import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { StudyActivity, WordGroup, PaginatedResponse } from "@/lib/types/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudyActivityLaunch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedGroupId, setSelectedGroupId] = useState<number>()
  
  const { data: activity, loading, error, request } = useApi<StudyActivity>()
  const { data: groups, loading: groupsLoading, request: requestGroups } = useApi<PaginatedResponse<WordGroup>>()

  useEffect(() => {
    if (id) {
      request(() => api.getStudyActivity(Number(id)))
      requestGroups(() => api.getWordGroups({}))
    }
  }, [id, request, requestGroups])

  const handleLaunch = async () => {
    if (!selectedGroupId) return
    
    try {
      const result = await api.launchStudyActivity(Number(id), selectedGroupId)
      window.open(result.launchUrl, '_blank')
      navigate(`/study_activities/${id}`)
    } catch (error) {
      console.error('Failed to launch activity:', error)
    }
  }

  if (loading || groupsLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!activity || !groups) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Launch {activity.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Select Word Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={selectedGroupId?.toString()} 
            onValueChange={(value) => setSelectedGroupId(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a word group" />
            </SelectTrigger>
            <SelectContent>
              {groups.data.map((group: WordGroup) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name} ({group.wordCount} words)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleLaunch}
            disabled={!selectedGroupId}
            className="w-full"
          >
            Launch Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 