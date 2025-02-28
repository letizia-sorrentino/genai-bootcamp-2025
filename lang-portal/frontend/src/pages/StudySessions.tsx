import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { StudySession, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { SortableTable } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Column } from "@/lib/types/table"

export default function StudySessions() {
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof StudySession>('startTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const { data: sessions, loading, error, request } = useApi<PaginatedResponse<StudySession>>()

  useEffect(() => {
    request(() => api.getStudySessions({
      page,
      sortBy: sortColumn,
      sortDirection
    }))
  }, [request, page, sortColumn, sortDirection])

  const columns: Column<StudySession>[] = [
    {
      key: 'activityName' as keyof StudySession,
      header: 'Activity',
      sortable: true
    },
    {
      key: 'groupName' as keyof StudySession,
      header: 'Group',
      sortable: true
    },
    {
      key: 'startTime' as keyof StudySession,
      header: 'Date',
      sortable: true,
      render: (session) => format(new Date(session.startTime), 'PPp')
    },
    {
      key: 'reviewItemCount' as keyof StudySession,
      header: 'Items',
      sortable: true
    },
    {
      key: 'correctCount' as keyof StudySession,
      header: 'Correct',
      sortable: true
    },
    {
      key: 'incorrectCount' as keyof StudySession,
      header: 'Wrong',
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

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!sessions) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study Sessions</h1>
      
      <div className="space-y-4">
        <SortableTable
          data={sessions.data}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        
        <Pagination
          currentPage={page}
          totalPages={sessions.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
} 