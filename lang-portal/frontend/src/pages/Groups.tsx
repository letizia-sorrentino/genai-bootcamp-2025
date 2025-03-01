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

  // Add logging to debug the data
  useEffect(() => {
    if (groups && groups.data) {
      console.log('Groups data received:', groups.data);
      // Check for any invalid date values
      groups.data.forEach(group => {
        if (group.createdAt && isNaN(new Date(group.createdAt).getTime())) {
          console.error('Invalid createdAt date found:', group.createdAt, 'for group:', group.name);
        }
        if (group.lastStudied && isNaN(new Date(group.lastStudied).getTime())) {
          console.error('Invalid lastStudied date found:', group.lastStudied, 'for group:', group.name);
        }
      });
    }
  }, [groups]);

  const columns = [
    {
      key: 'name' as keyof WordGroup,
      header: 'Name',
      sortable: true,
      render: (group: WordGroup) => (
        <Link to={`/groups/${group.id}`} className="hover:underline">
          {group.name}
        </Link>
      )
    },
    {
      key: 'description' as keyof WordGroup,
      header: 'Description',
      sortable: true
    },
    {
      key: 'wordCount' as keyof WordGroup,
      header: 'Words',
      sortable: true
    },
    {
      key: 'lastStudied' as keyof WordGroup,
      header: 'Last Studied',
      sortable: true,
      render: (group: WordGroup) => {
        if (!group.lastStudied) return 'Never';
        try {
          const date = new Date(group.lastStudied);
          // Check if date is valid before formatting
          return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'PPp');
        } catch (error) {
          console.error('Error formatting lastStudied date:', error);
          return 'Invalid date';
        }
      }
    },
    {
      key: 'createdAt' as keyof WordGroup,
      header: 'Created',
      sortable: true,
      render: (group: WordGroup) => {
        try {
          const date = new Date(group.createdAt);
          // Check if date is valid before formatting
          return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'PP');
        } catch (error) {
          console.error('Error formatting createdAt date:', error);
          return 'Invalid date';
        }
      }
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