import { SortableTable } from "./ui/table"
import { Pagination } from "./ui/pagination"
import { Link } from "react-router-dom"
import { format } from "date-fns"

interface StudySession {
  id: number
  activityName: string
  groupName: string
  startTime: string
  endTime: string
  reviewItemCount: number
}

interface StudySessionListProps {
  sessions: StudySession[]
  currentPage: number
  totalPages: number
  sortColumn?: keyof StudySession
  sortDirection?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSort: (column: keyof StudySession) => void
  className?: string
}

export function StudySessionList({
  sessions,
  currentPage,
  totalPages,
  sortColumn,
  sortDirection,
  onPageChange,
  onSort,
  className
}: StudySessionListProps) {
  const columns = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (session: StudySession) => (
        <Link to={`/study_sessions/${session.id}`} className="hover:underline">
          {session.id}
        </Link>
      )
    },
    {
      key: 'activityName',
      header: 'Activity',
      sortable: true,
      render: (session: StudySession) => (
        <Link to={`/study_activities/${session.id}`} className="hover:underline">
          {session.activityName}
        </Link>
      )
    },
    {
      key: 'groupName',
      header: 'Group',
      sortable: true,
      render: (session: StudySession) => (
        <Link to={`/groups/${session.id}`} className="hover:underline">
          {session.groupName}
        </Link>
      )
    },
    {
      key: 'startTime',
      header: 'Start Time',
      sortable: true,
      render: (session: StudySession) => 
        format(new Date(session.startTime), 'yyyy-MM-dd HH:mm')
    },
    {
      key: 'endTime',
      header: 'End Time',
      sortable: true,
      render: (session: StudySession) => 
        format(new Date(session.endTime), 'yyyy-MM-dd HH:mm')
    },
    {
      key: 'reviewItemCount',
      header: '# Review Items',
      sortable: true
    }
  ]

  return (
    <div className="space-y-4">
      <SortableTable
        data={sessions}
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        className={className}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
} 