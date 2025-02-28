import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

interface StudyActivityCardProps {
  title: string
  thumbnail: string
  onLaunch: () => void
  onView: () => void
  className?: string
}

export function StudyActivityCard({
  title,
  thumbnail,
  onLaunch,
  onView,
  className
}: StudyActivityCardProps) {
  return (
    <Card className={cn("w-[300px]", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={thumbnail}
          alt={title}
          className="aspect-video w-full rounded-md object-cover"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onView}>
          View
        </Button>
        <Button onClick={onLaunch}>
          Launch
        </Button>
      </CardFooter>
    </Card>
  )
} 