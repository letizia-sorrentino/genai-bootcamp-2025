import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickStats } from "@/lib/types/api"

interface QuickStatsCardProps {
  stats: QuickStats
}

export function QuickStatsCard({ stats }: QuickStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
          <div className="text-2xl font-bold">{stats.totalSessions}</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground">Active Groups</div>
          <div className="text-2xl font-bold">{stats.activeGroups}</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground">Study Streak</div>
          <div className="text-2xl font-bold">{stats.studyStreak} days</div>
        </div>
      </CardContent>
    </Card>
  )
} 