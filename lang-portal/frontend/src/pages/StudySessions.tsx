import { useState } from "react"
import { SortableTable } from "@/components/ui/table"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Column } from "@/lib/types/table"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/store/hooks"
import { StudySession } from "@/lib/types/api"

export default function StudySessions() {
  const [sortColumn, setSortColumn] = useState<keyof StudySession>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Get session data from Redux store
  const sessionStats = useAppSelector(state => state.sessionStats)
  const sessions = sessionStats.recentSessions.map((session, index) => ({
    id: index + 1,
    activity_name: 'Word Quiz',
    group_id: session.groupId || 0,
    group_name: session.groupId ? `Group ${session.groupId}` : 'General',
    start_time: session.date,
    end_time: session.date,
    review_items_count: session.total
  }))

  const columns: Column<StudySession>[] = [
    {
      key: 'activity_name' as keyof StudySession,
      header: 'Activity Name',
      sortable: true
    },
    {
      key: 'group_name' as keyof StudySession,
      header: 'Group Name',
      sortable: true,
      render: (session) => (
        <Link to={`/groups/${session.group_id}`} className="hover:underline">
          {session.group_name}
        </Link>
      )
    },
    {
      key: 'start_time' as keyof StudySession,
      header: 'Start Time',
      sortable: true,
      render: (session) => format(new Date(session.start_time), 'PPp')
    },
    {
      key: 'end_time' as keyof StudySession,
      header: 'End Time',
      sortable: true,
      render: (session) => session.end_time ? format(new Date(session.end_time), 'PPp') : 'In Progress'
    },
    {
      key: 'review_items_count' as keyof StudySession,
      header: 'Review Items',
      sortable: true
    }
  ]

  const handleSort = (column: keyof StudySession) => {
    if (column === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Study Sessions</h1>
        <p className="text-gray-500">No study sessions yet. Complete a quiz to see your sessions here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study Sessions</h1>

      {/* Study Sessions Table */}
      <Card>
        <CardContent>
          <SortableTable
            data={sessions}
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  )
} 