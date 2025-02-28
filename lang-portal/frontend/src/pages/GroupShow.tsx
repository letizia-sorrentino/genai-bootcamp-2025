import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { WordGroup, Word, StudySession, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SortableTable } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { format } from "date-fns"
import { AudioPlayer } from "@/components/ui/audio-player"
import { Column } from "@/lib/types/table"

export default function GroupShow() {
  const { id } = useParams()
  const [wordsPage, setWordsPage] = useState(1)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [wordSort, setWordSort] = useState<{column: keyof Word, direction: SortDirection}>({
    column: 'italian',
    direction: 'asc'
  })

  const { data: group, loading, error, request } = useApi<WordGroup>()
  const { 
    data: words,
    loading: wordsLoading,
    request: requestWords 
  } = useApi<PaginatedResponse<Word>>()
  const {
    data: sessions,
    loading: sessionsLoading,
    request: requestSessions
  } = useApi<PaginatedResponse<StudySession>>()

  useEffect(() => {
    if (id) {
      request(() => api.getWordGroup(Number(id)))
      requestWords(() => api.getGroupWords(Number(id), {
        page: wordsPage,
        sortBy: wordSort.column,
        sortDirection: wordSort.direction
      }))
      requestSessions(() => api.getGroupSessions(Number(id), {
        page: sessionsPage
      }))
    }
  }, [id, request, requestWords, requestSessions, wordsPage, sessionsPage, wordSort])

  const wordColumns: Column<Word>[] = [
    {
      key: 'italian' as keyof Word,
      header: 'Italian',
      sortable: true
    },
    {
      key: 'english' as keyof Word,
      header: 'English',
      sortable: true
    },
    {
      key: 'audioUrl' as keyof Word,
      header: 'Audio',
      render: (word: Word) => (
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

  const sessionColumns: Column<StudySession>[] = [
    {
      key: 'activityName',
      header: 'Activity'
    },
    {
      key: 'startTime',
      header: 'Date',
      render: (session: StudySession) => format(new Date(session.startTime), 'PP')
    },
    {
      key: 'correctCount',
      header: 'Correct'
    },
    {
      key: 'incorrectCount',
      header: 'Wrong'
    }
  ]

  const handleWordSort = (column: keyof Word) => {
    setWordSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!group) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{group.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-sm text-muted-foreground">Description</div>
            <p>{group.description}</p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Words</div>
            <p>{group.wordCount}</p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Studied</div>
            <p>{group.lastStudied ? format(new Date(group.lastStudied), 'PPp') : 'Never'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Words</h2>
        {wordsLoading ? (
          <div>Loading words...</div>
        ) : words?.data ? (
          <>
            <SortableTable
              data={words.data}
              columns={wordColumns}
              sortColumn={wordSort.column}
              sortDirection={wordSort.direction}
              onSort={handleWordSort}
            />
            <Pagination
              currentPage={wordsPage}
              totalPages={words.totalPages}
              onPageChange={setWordsPage}
            />
          </>
        ) : null}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Study Sessions</h2>
        {sessionsLoading ? (
          <div>Loading sessions...</div>
        ) : sessions?.data ? (
          <>
            <SortableTable
              data={sessions.data}
              columns={sessionColumns}
            />
            <Pagination
              currentPage={sessionsPage}
              totalPages={sessions.totalPages}
              onPageChange={setSessionsPage}
            />
          </>
        ) : null}
      </div>
    </div>
  )
} 