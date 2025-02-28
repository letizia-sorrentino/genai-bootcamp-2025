import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StudyProgress } from "@/lib/types/api"

interface StudyProgressCardProps {
  progress: StudyProgress
}

export function StudyProgressCard({ progress }: StudyProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Words Studied</div>
          <div>{progress.wordsStudied} of {progress.totalWords} words</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground">Mastery Progress</div>
          <Progress value={progress.masteryPercentage} className="mt-2" />
          <div className="mt-1 text-sm text-muted-foreground text-right">
            {progress.masteryPercentage}%
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 