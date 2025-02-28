import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { Word, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { SortableTable } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Link } from "react-router-dom"
import { Column } from "@/lib/types/table"
import { AudioPlayer } from "@/components/ui/audio-player"

export default function Words() {
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof Word>('italian')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  const { data: words, loading, error, request } = useApi<PaginatedResponse<Word>>()

  useEffect(() => {
    request(() => api.getWords({
      page,
      sortBy: sortColumn,
      sortDirection
    }))
  }, [request, page, sortColumn, sortDirection])

  const columns: Column<Word>[] = [
    {
      key: 'italian' as keyof Word,
      header: 'Italian',
      sortable: true,
      render: (word) => (
        <Link to={`/words/${word.id}`} className="hover:underline">
          {word.italian}
        </Link>
      )
    },
    {
      key: 'english' as keyof Word,
      header: 'English',
      sortable: true
    },
    {
      key: 'audioUrl' as keyof Word,
      header: 'Audio',
      render: (word) => (
        <AudioPlayer src={word.audioUrl} />
      )
    },
    {
      key: 'correctCount' as keyof Word,
      header: 'Correct',
      sortable: true
    },
    {
      key: 'wrongCount' as keyof Word,
      header: 'Wrong',
      sortable: true
    }
  ]

  const handleSort = (column: keyof Word) => {
    if (column === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!words) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Words</h1>
      
      <div className="space-y-4">
        <SortableTable
          data={words.data}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        
        <Pagination
          currentPage={page}
          totalPages={words.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
} 