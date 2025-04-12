import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { WordGroup, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { SortableTable } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Link, useNavigate } from "react-router-dom"
import { Column } from "@/lib/types/table"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/hooks"
import { format } from "date-fns"

export default function Groups() {
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof WordGroup>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const navigate = useNavigate()
  
  const { data: groups, loading, error, request } = useApi<PaginatedResponse<WordGroup>>()
  const sessionStats = useAppSelector(state => state.sessionStats)

  useEffect(() => {
    request(() => api.getWordGroups({
      page,
      sortBy: sortColumn,
      sortDirection
    }))
  }, [request, page, sortColumn, sortDirection, sessionStats])

  const handlePracticeGroup = (groupId: number) => {
    navigate(`/word_quiz/${groupId}`)
  }

  const columns: Column<WordGroup>[] = [
    {
      key: 'name',
      header: 'Group Name',
      sortable: true,
      render: (group: WordGroup) => (
        <Link to={`/groups/${group.id}`} className="hover:underline">
          {group.name}
        </Link>
      )
    },
    {
      key: 'wordCount',
      header: '# Words',
      sortable: true,
      render: () => 15
    },
    {
      key: 'lastStudied',
      header: 'Last Studied',
      sortable: true,
      render: (group: WordGroup) => {
        const lastSession = sessionStats.recentSessions
          .filter(session => session.groupId === group.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        return lastSession ? format(new Date(lastSession.date), 'PPp') : 'Never';
      }
    },
    {
      key: 'id',
      header: '',
      sortable: false,
      render: (group: WordGroup) => (
        <div className="flex justify-end">
          <Button onClick={() => handlePracticeGroup(group.id)}>
            Practice
          </Button>
        </div>
      )
    }
  ]

  const handleSort = (column: keyof WordGroup) => {
    if (column === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!groups) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Word Groups</h1>
      
      <div className="space-y-4">
        <SortableTable
          data={groups.data}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        
        <Pagination
          currentPage={page}
          totalPages={groups.pagination.total_pages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
} 