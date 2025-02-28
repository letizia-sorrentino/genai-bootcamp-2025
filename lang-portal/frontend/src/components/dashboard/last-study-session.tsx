import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LastStudySession } from "@/lib/types/api"
import { Link } from "react-router-dom"
import { format } from "date-fns"

interface LastStudySessionCardProps {
  session: LastStudySession
}

export function LastStudySessionCard({ session }: LastStudySessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Study Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Activity</div>
          <div>{session.activityName}</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground">Last Accessed</div>
          <div>{format(new Date(session.lastAccessed), 'PPp')}</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Results</div>
          <div className="flex gap-4">
            <div className="text-green-600">Correct: {session.correctCount}</div>
            <div className="text-red-600">Incorrect: {session.incorrectCount}</div>
          </div>
        </div>

        <div>
          <Link 
            to={`/groups/${session.groupId}`}
            className="text-primary hover:underline"
          >
            View Group: {session.groupName}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 