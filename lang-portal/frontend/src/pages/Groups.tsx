import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { WordGroup, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { SortableTable } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Link } from "react-router-dom"
import { format } from "date-fns"

export default function Groups() {
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof WordGroup>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  const { data: groups, loading, error, request } = useApi<PaginatedResponse<WordGroup>>()

  useEffect(() => {
    request(() => api.getWordGroups({
      page,
      sortBy: sortColumn,
      sortDirection
    }))
  }, [request, page, sortColumn, sortDirection])

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (group: WordGroup) => (
        <Link to={`/groups/${group.id}`} className="hover:underline">
          {group.name}
        </Link>
      )
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true
    },
    {
      key: 'wordCount',
      header: 'Words',
      sortable: true
    },
    {
      key: 'lastStudied',
      header: 'Last Studied',
      sortable: true,
      render: (group: WordGroup) => 
        group.lastStudied ? format(new Date(group.lastStudied), 'PPp') : 'Never'
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (group: WordGroup) => format(new Date(group.createdAt), 'PP')
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
          totalPages={groups.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
} 